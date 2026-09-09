package com.backend.waitlist;

import com.backend.auth.jwt.JwtService;
import com.backend.barbers.BarberProfile;
import com.backend.barbers.BarberRepository;
import com.backend.barbers.BarberStatus;
import com.backend.customers.Customer;
import com.backend.customers.CustomerRepository;
import com.backend.services.ServiceOffering;
import com.backend.services.ServiceOfferingRepository;
import com.backend.services.ServiceType;
import com.backend.tenants.Tenant;
import com.backend.tenants.TenantRepository;
import com.backend.units.Unit;
import com.backend.units.UnitRepository;
import com.backend.users.Role;
import com.backend.users.User;
import com.backend.users.UserRepository;
import com.backend.users.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class WaitlistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BarberRepository barberRepository;

    @Autowired
    private ServiceOfferingRepository serviceOfferingRepository;

    private String adminToken;
    private String clientToken;
    private UUID unitId;
    private UUID customerId;
    private UUID serviceId;
    private UUID barberId;

    @BeforeEach
    void seed() {
        Tenant tenant = tenantRepository.save(new Tenant(
                null, "Barbearia Fila", null, null,
                "America/Sao_Paulo", "pt-BR", "BRL", null, null
        ));
        Unit unit = unitRepository.save(new Unit(
                null, tenant, "Unidade Centro", "America/Sao_Paulo", true
        ));
        unitId = unit.getId();

        User clientUser = userRepository.save(new User(
                null, "Cliente Fila", "cliente@fila.dev",
                passwordEncoder.encode("senha-correta"),
                Role.CLIENT, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));
        clientToken = jwtService.generateTokemn(clientUser);

        Customer customer = customerRepository.save(new Customer(
                null, tenant.getId(), "Cliente Fila", "cliente@fila.dev", "11999999999", null, null
        ));
        customer.setUserId(clientUser.getId());
        customerId = customerRepository.save(customer).getId();

        User barberUser = userRepository.save(new User(
                null, "Barbeiro Fila", "barbeiro@fila.dev",
                passwordEncoder.encode("senha-correta"),
                Role.BARBER, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));
        BarberProfile barberProfile = new BarberProfile();
        barberProfile.setUser(barberUser);
        barberProfile.setUnit(unit);
        barberProfile.setDisplayName("Barbeiro Fila");
        barberProfile.setDefaultCommissionPercent(40);
        barberProfile.setStatus(BarberStatus.ACTIVE);
        barberId = barberRepository.save(barberProfile).getId();

        ServiceOffering service = serviceOfferingRepository.save(new ServiceOffering(
                null, tenant.getId(), null, null, ServiceType.SERVICE,
                "Corte Masculino", null, 30, 0, 0,
                new BigDecimal("80.00"), 0, true
        ));
        serviceId = service.getId();

        User admin = userRepository.save(new User(
                null, "Admin Fila", "admin@fila.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));
        adminToken = jwtService.generateTokemn(admin);
    }

    @Test
    void clienteEntraNaFilaEStaffVeEEndeliste() throws Exception {
        LocalDate amanha = LocalDate.now().plusDays(1);

        mockMvc.perform(post("/waitlist-entries")
                        .header("Authorization", "Bearer " + clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"unitId":"%s","serviceId":"%s","preferredBarberId":"%s","windowStartAt":"%sT09:00:00","windowEndAt":"%sT18:00:00"}
                                """.formatted(unitId, serviceId, barberId, amanha, amanha)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.customerName").value("Cliente Fila"))
                .andExpect(jsonPath("$.serviceName").value("Corte Masculino"));

        mockMvc.perform(get("/waitlist-entries").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].preferredBarberName").value("Barbeiro Fila"));

        // Cliente só vê a própria entrada, não a fila inteira do tenant.
        mockMvc.perform(get("/waitlist-entries").header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].customerId").value(customerId.toString()));
    }

    @Test
    void clienteNaoCancelaEntradaDeOutroCliente() throws Exception {
        LocalDate amanha = LocalDate.now().plusDays(1);

        String created = mockMvc.perform(post("/waitlist-entries")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"unitId":"%s","customerId":"%s","serviceId":"%s","windowStartAt":"%sT09:00:00","windowEndAt":"%sT18:00:00"}
                                """.formatted(unitId, customerId, serviceId, amanha, amanha)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String entryId = objectMapper.readTree(created).get("id").asText();

        Tenant outroTenant = tenantRepository.save(new Tenant(
                null, "Outra Barbearia", null, null,
                "America/Sao_Paulo", "pt-BR", "BRL", null, null
        ));
        User outroCliente = userRepository.save(new User(
                null, "Outro Cliente", "outro@fila.dev",
                passwordEncoder.encode("senha-correta"),
                Role.CLIENT, UserStatus.ACTIVE, outroTenant.getId(),
                null, null, null
        ));
        Customer outroCustomer = customerRepository.save(new Customer(
                null, outroTenant.getId(), "Outro Cliente", "outro@fila.dev", "11988888888", null, null
        ));
        outroCustomer.setUserId(outroCliente.getId());
        customerRepository.save(outroCustomer);
        String outroToken = jwtService.generateTokemn(outroCliente);

        mockMvc.perform(delete("/waitlist-entries/{id}", entryId).header("Authorization", "Bearer " + outroToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/waitlist-entries/{id}", entryId).header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/waitlist-entries").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void janelaFinalAntesDaInicialERejeitada() throws Exception {
        LocalDate amanha = LocalDate.now().plusDays(1);

        mockMvc.perform(post("/waitlist-entries")
                        .header("Authorization", "Bearer " + clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"unitId":"%s","serviceId":"%s","windowStartAt":"%sT18:00:00","windowEndAt":"%sT09:00:00"}
                                """.formatted(unitId, serviceId, amanha, amanha)))
                .andExpect(status().isBadRequest());
    }

    private String criarEntrada(String token, String customerIdOrNull) throws Exception {
        LocalDate amanha = LocalDate.now().plusDays(1);
        String customerField = customerIdOrNull != null ? "\"customerId\":\"" + customerIdOrNull + "\"," : "";
        String created = mockMvc.perform(post("/waitlist-entries")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {%s"unitId":"%s","serviceId":"%s","windowStartAt":"%sT09:00:00","windowEndAt":"%sT18:00:00"}
                                """.formatted(customerField, unitId, serviceId, amanha, amanha)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(created).get("id").asText();
    }

    @Test
    void clienteAceitaOfertaEViraAgendamento() throws Exception {
        String entryId = criarEntrada(adminToken, customerId.toString());
        LocalDate amanha = LocalDate.now().plusDays(1);

        String offerResponse = mockMvc.perform(post("/waitlist-entries/{id}/offers", entryId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"barberId":"%s","slotStartAt":"%sT10:00:00","slotEndAt":"%sT10:30:00"}
                                """.formatted(barberId, amanha, amanha)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn().getResponse().getContentAsString();
        String offerId = objectMapper.readTree(offerResponse).get("id").asText();

        // Cliente vê a notificação da oferta.
        mockMvc.perform(get("/notifications").header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("WAITLIST_OFFER"));

        mockMvc.perform(post("/waitlist-offers/{id}/accept", offerId)
                        .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.barberId").value(barberId.toString()))
                .andExpect(jsonPath("$.status").value("PENDING"));

        // A entrada da fila vira BOOKED e some da fila ativa.
        mockMvc.perform(get("/waitlist-entries").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void staffNaoConseguerOfertarHorarioJaOcupado() throws Exception {
        String entryId = criarEntrada(adminToken, customerId.toString());
        LocalDate amanha = LocalDate.now().plusDays(1);

        mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"unitId":"%s","customerId":"%s","barberId":"%s","startAt":"%sT10:00:00","channel":"ADMIN","items":[{"serviceId":"%s"}]}
                                """.formatted(unitId, customerId, barberId, amanha, serviceId)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/waitlist-entries/{id}/offers", entryId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"barberId":"%s","slotStartAt":"%sT10:00:00","slotEndAt":"%sT10:30:00"}
                                """.formatted(barberId, amanha, amanha)))
                .andExpect(status().isConflict());
    }

    @Test
    void clienteRejeitaOfertaEEntradaContinuaAtiva() throws Exception {
        String entryId = criarEntrada(adminToken, customerId.toString());
        LocalDate amanha = LocalDate.now().plusDays(1);

        String offerResponse = mockMvc.perform(post("/waitlist-entries/{id}/offers", entryId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"barberId":"%s","slotStartAt":"%sT11:00:00","slotEndAt":"%sT11:30:00"}
                                """.formatted(barberId, amanha, amanha)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String offerId = objectMapper.readTree(offerResponse).get("id").asText();

        mockMvc.perform(post("/waitlist-offers/{id}/reject", offerId)
                        .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isNoContent());

        // Rejeitar não tira da fila — staff pode ofertar pra outro horário/barbeiro.
        mockMvc.perform(get("/waitlist-entries").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"));

        // Oferta já respondida não aceita de novo.
        mockMvc.perform(post("/waitlist-offers/{id}/accept", offerId)
                        .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isConflict());
    }

    @Test
    void recusaReofertaAutomaticamenteParaProximoDaFila() throws Exception {
        String primeiraEntryId = criarEntrada(adminToken, customerId.toString());

        User outroCliente = userRepository.save(new User(
                null, "Segundo Cliente", "segundo@fila.dev",
                passwordEncoder.encode("senha-correta"),
                Role.CLIENT, UserStatus.ACTIVE, unitRepository.findById(unitId).orElseThrow().getTenant().getId(),
                null, null, null
        ));
        Customer outroCustomer = customerRepository.save(new Customer(
                null, outroCliente.getTenantId(), "Segundo Cliente", "segundo@fila.dev", "11977777777", null, null
        ));
        outroCustomer.setUserId(outroCliente.getId());
        String segundoCustomerId = customerRepository.save(outroCustomer).getId().toString();
        String segundoToken = jwtService.generateTokemn(outroCliente);
        String segundaEntryId = criarEntrada(adminToken, segundoCustomerId);

        LocalDate amanha = LocalDate.now().plusDays(1);
        String offerResponse = mockMvc.perform(post("/waitlist-entries/{id}/offers", primeiraEntryId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"barberId":"%s","slotStartAt":"%sT11:00:00","slotEndAt":"%sT11:30:00"}
                                """.formatted(barberId, amanha, amanha)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String offerId = objectMapper.readTree(offerResponse).get("id").asText();

        mockMvc.perform(post("/waitlist-offers/{id}/reject", offerId)
                        .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isNoContent());

        // A vaga recusada pelo primeiro vira uma oferta nova pro segundo da fila.
        mockMvc.perform(get("/waitlist-entries/{id}/offers", segundaEntryId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[0].barberId").value(barberId.toString()));

        // O segundo cliente consegue aceitar a vaga reofertada automaticamente.
        String segundaOfferId = objectMapper.readTree(
                mockMvc.perform(get("/waitlist-entries/{id}/offers", segundaEntryId)
                                .header("Authorization", "Bearer " + adminToken))
                        .andReturn().getResponse().getContentAsString()
        ).get(0).get("id").asText();

        mockMvc.perform(post("/waitlist-offers/{id}/accept", segundaOfferId)
                        .header("Authorization", "Bearer " + segundoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.barberId").value(barberId.toString()));
    }

    @Test
    void clienteNaoOfertaVagaParaSiMesmo() throws Exception {
        String entryId = criarEntrada(adminToken, customerId.toString());
        LocalDate amanha = LocalDate.now().plusDays(1);

        mockMvc.perform(post("/waitlist-entries/{id}/offers", entryId)
                        .header("Authorization", "Bearer " + clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"barberId":"%s","slotStartAt":"%sT10:00:00","slotEndAt":"%sT10:30:00"}
                                """.formatted(barberId, amanha, amanha)))
                .andExpect(status().isForbidden());
    }
}
