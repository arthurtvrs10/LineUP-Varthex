package com.backend.dashboard;

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
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class DashboardControllerTest {

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
    private UUID unitId;
    private UUID customerId;
    private UUID barberId;
    private UUID serviceId;

    @BeforeEach
    void seed() {
        Tenant tenant = tenantRepository.save(new Tenant(
                null, "Barbearia Dashboard", null, null,
                "America/Sao_Paulo", "pt-BR", "BRL", null, null
        ));
        Unit unit = unitRepository.save(new Unit(
                null, tenant, "Unidade Centro", "America/Sao_Paulo", true
        ));
        unitId = unit.getId();

        Customer customer = customerRepository.save(new Customer(
                null, tenant.getId(), "Cliente Teste", "cliente@dashboard.dev", "11999999999", null, null
        ));
        customerId = customer.getId();

        User barberUser = userRepository.save(new User(
                null, "Barbeiro Teste", "barbeiro@dashboard.dev",
                passwordEncoder.encode("senha-correta"),
                Role.BARBER, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));
        BarberProfile barberProfile = new BarberProfile();
        barberProfile.setUser(barberUser);
        barberProfile.setUnit(unit);
        barberProfile.setDisplayName("Barbeiro Teste");
        barberProfile.setDefaultCommissionPercent(50);
        barberProfile.setStatus(BarberStatus.ACTIVE);
        barberId = barberRepository.save(barberProfile).getId();

        ServiceOffering service = serviceOfferingRepository.save(new ServiceOffering(
                null, tenant.getId(), null, null, ServiceType.SERVICE,
                "Corte Masculino", null, 30, 0, 0,
                new BigDecimal("80.00"), 0, true
        ));
        serviceId = service.getId();

        User admin = userRepository.save(new User(
                null, "Admin", "admin@dashboard.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));
        adminToken = jwtService.generateTokemn(admin);
    }

    @Test
    void resumoDoDiaContaAgendamentosPorStatusESomaValorConcluido() throws Exception {
        // Precisa ser hoje: scheduled/completed/canceled filtram por startAt do
        // agendamento, mas commissionAmount soma por createdAt do lançamento
        // (provisionado no momento da conclusão) — os dois só batem no mesmo
        // "date" se o agendamento for hoje.
        String todayStr = LocalDate.now().toString();

        String appt1 = mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"unitId":"%s","customerId":"%s","barberId":"%s","startAt":"%sT09:00:00","channel":"ADMIN","items":[{"serviceId":"%s"}]}
                                """.formatted(unitId, customerId, barberId, todayStr, serviceId)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String id1 = objectMapper.readTree(appt1).get("id").asText();

        mockMvc.perform(post("/appointments/{id}/confirm", id1).header("Authorization", "Bearer " + adminToken));
        mockMvc.perform(post("/appointments/{id}/check-in", id1).header("Authorization", "Bearer " + adminToken));
        mockMvc.perform(post("/appointments/{id}/start", id1).header("Authorization", "Bearer " + adminToken));
        mockMvc.perform(post("/appointments/{id}/complete", id1).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        String appt2 = mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"unitId":"%s","customerId":"%s","barberId":"%s","startAt":"%sT11:00:00","channel":"ADMIN","items":[{"serviceId":"%s"}]}
                                """.formatted(unitId, customerId, barberId, todayStr, serviceId)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String id2 = objectMapper.readTree(appt2).get("id").asText();
        mockMvc.perform(post("/appointments/{id}/cancel", id2).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/dashboard/overview")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("date", todayStr)
                        .param("barberId", barberId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scheduled").value(2))
                .andExpect(jsonPath("$.completed").value(1))
                .andExpect(jsonPath("$.canceled").value(1))
                .andExpect(jsonPath("$.noShow").value(0))
                .andExpect(jsonPath("$.grossAmount").value("80.00"))
                .andExpect(jsonPath("$.commissionAmount").value("40.00"));
    }
}
