package com.backend.scheduling;

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
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AppointmentControllerTest {

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

    private String token;
    private String clientToken;
    private String otherClientToken;
    private UUID unitId;
    private UUID customerId;
    private UUID barberId;
    private UUID serviceId;

    @BeforeEach
    void seedTenant() {
        Tenant tenant = tenantRepository.save(new Tenant(
                null, "Barbearia Teste", null, null,
                "America/Sao_Paulo", "pt-BR", "BRL", null, null
        ));

        Unit unit = unitRepository.save(new Unit(
                null, tenant, "Unidade Centro", "America/Sao_Paulo", true
        ));
        unitId = unit.getId();

        Customer customer = customerRepository.save(new Customer(
                null, tenant.getId(), "Cliente Teste", "cliente@agenda.dev", "11999999999", null, null
        ));
        customerId = customer.getId();

        User barberUser = userRepository.save(new User(
                null, "Barbeiro Teste", "barbeiro@agenda.dev",
                passwordEncoder.encode("senha-correta"),
                Role.BARBER, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));

        BarberProfile barberProfile = new BarberProfile();
        barberProfile.setUser(barberUser);
        barberProfile.setUnit(unit);
        barberProfile.setDisplayName("Barbeiro Teste");
        barberProfile.setDefaultCommissionPercent(0);
        barberProfile.setStatus(BarberStatus.ACTIVE);
        barberId = barberRepository.save(barberProfile).getId();

        ServiceOffering service = serviceOfferingRepository.save(new ServiceOffering(
                null, tenant.getId(), null, null, ServiceType.SERVICE,
                "Corte Masculino", null, 30, 0, 0,
                new BigDecimal("49.90"), 0, true
        ));
        serviceId = service.getId();

        User admin = userRepository.save(new User(
                null, "Admin", "admin@agenda.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));
        token = jwtService.generateTokemn(admin);

        User clientUser = userRepository.save(new User(
                null, "Cliente Teste", "cliente@agenda.dev",
                passwordEncoder.encode("senha-correta"),
                Role.CLIENT, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));
        customer.setUserId(clientUser.getId());
        customerRepository.save(customer);
        clientToken = jwtService.generateTokemn(clientUser);

        Customer outraPessoa = customerRepository.save(new Customer(
                null, tenant.getId(), "Outro Cliente", "outro.cliente@agenda.dev", "11988888888", null, null
        ));
        User outroClientUser = userRepository.save(new User(
                null, "Outro Cliente", "outro.cliente@agenda.dev",
                passwordEncoder.encode("senha-correta"),
                Role.CLIENT, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));
        outraPessoa.setUserId(outroClientUser.getId());
        customerRepository.save(outraPessoa);
        otherClientToken = jwtService.generateTokemn(outroClientUser);
    }

    private String createAppointmentBody(String startAt) {
        return """
                {
                  "unitId": "%s",
                  "customerId": "%s",
                  "barberId": "%s",
                  "startAt": "%s",
                  "channel": "ADMIN",
                  "items": [{"serviceId": "%s"}]
                }
                """.formatted(unitId, customerId, barberId, startAt, serviceId);
    }

    @Test
    void criaAgendamentoCalculandoTotalEHorarioFinal() throws Exception {
        mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createAppointmentBody("2026-10-01T10:00:00")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.totalAmount").value("49.90"))
                .andExpect(jsonPath("$.endAt").value("2026-10-01T10:30:00"))
                .andExpect(jsonPath("$.items[0].name").value("Corte Masculino"));
    }

    @Test
    void naoPermiteAgendamentoConflitanteParaOMesmoBarbeiro() throws Exception {
        mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createAppointmentBody("2026-10-01T10:00:00")))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createAppointmentBody("2026-10-01T10:15:00")))
                .andExpect(status().isConflict());
    }

    @Test
    void buscaEListaAgendamentoNoIntervalo() throws Exception {
        String response = mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createAppointmentBody("2026-10-01T10:00:00")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(get("/appointments/{id}", id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"));

        mockMvc.perform(get("/appointments")
                        .header("Authorization", "Bearer " + token)
                        .param("from", "2026-10-01T00:00:00")
                        .param("to", "2026-10-02T00:00:00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id));

        mockMvc.perform(get("/appointments")
                        .header("Authorization", "Bearer " + token)
                        .param("from", "2026-11-01T00:00:00")
                        .param("to", "2026-11-02T00:00:00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void executaMaquinaDeEstadosAteConcluir() throws Exception {
        String response = mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createAppointmentBody("2026-10-01T10:00:00")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(post("/appointments/{id}/confirm", id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        mockMvc.perform(post("/appointments/{id}/check-in", id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CHECKED_IN"));

        mockMvc.perform(post("/appointments/{id}/start", id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        mockMvc.perform(post("/appointments/{id}/complete", id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.completedAt").isNotEmpty());
    }

    @Test
    void naoPermiteTransicaoInvalida() throws Exception {
        String response = mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createAppointmentBody("2026-10-01T10:00:00")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(post("/appointments/{id}/complete", id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isConflict());
    }

    @Test
    void cancelaAgendamentoComMotivo() throws Exception {
        String response = mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createAppointmentBody("2026-10-01T10:00:00")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(post("/appointments/{id}/cancel", id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"reason":"Cliente desmarcou"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELED"))
                .andExpect(jsonPath("$.cancellationReason").value("Cliente desmarcou"));
    }

    @Test
    void agendamentoDeOutroTenantRetorna404() throws Exception {
        String response = mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createAppointmentBody("2026-10-01T10:00:00")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        User otherAdmin = userRepository.save(new User(
                null, "Outro Admin", "outro@agenda.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, UUID.randomUUID(),
                null, null, null
        ));
        String otherToken = jwtService.generateTokemn(otherAdmin);

        mockMvc.perform(get("/appointments/{id}", id)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void versaoDivergenteAoTransicionarRetorna409() throws Exception {
        String response = mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createAppointmentBody("2026-10-01T10:00:00")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(post("/appointments/{id}/confirm", id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"version": 99}
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    void clienteCriaAgendamentoIgnorandoCustomerIdDoCorpo() throws Exception {
        mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "unitId": "%s",
                                  "customerId": "%s",
                                  "barberId": "%s",
                                  "startAt": "2026-10-01T10:00:00",
                                  "channel": "CLIENT_WEB",
                                  "items": [{"serviceId": "%s"}]
                                }
                                """.formatted(unitId, UUID.randomUUID(), barberId, serviceId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customerId").value(customerId.toString()));
    }

    @Test
    void clienteVeSomenteOsProprosAgendamentos() throws Exception {
        mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createAppointmentBody("2026-10-01T10:00:00")))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + otherClientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createAppointmentBody("2026-10-02T10:00:00")))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/appointments")
                        .header("Authorization", "Bearer " + clientToken)
                        .param("from", "2026-10-01T00:00:00")
                        .param("to", "2026-10-05T00:00:00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].customerId").value(customerId.toString()));
    }

    @Test
    void clienteNaoConsegueConfirmarSoCancelar() throws Exception {
        String response = mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createAppointmentBody("2026-10-01T10:00:00")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(post("/appointments/{id}/confirm", id)
                        .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/appointments/{id}/cancel", id)
                        .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELED"));
    }

    @Test
    void clienteNaoVeAgendamentoDeOutroCliente() throws Exception {
        String response = mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createAppointmentBody("2026-10-01T10:00:00")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(get("/appointments/{id}", id)
                        .header("Authorization", "Bearer " + otherClientToken))
                .andExpect(status().isNotFound());
    }
}
