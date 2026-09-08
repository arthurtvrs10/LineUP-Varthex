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
}
