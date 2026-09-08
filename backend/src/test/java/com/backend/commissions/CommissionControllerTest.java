package com.backend.commissions;

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
class CommissionControllerTest {

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
    private String barberToken;
    private UUID unitId;
    private UUID customerId;
    private UUID barberId;
    private UUID serviceId;

    @BeforeEach
    void seed() {
        Tenant tenant = tenantRepository.save(new Tenant(
                null, "Barbearia Comissão", null, null,
                "America/Sao_Paulo", "pt-BR", "BRL", null, null
        ));

        Unit unit = unitRepository.save(new Unit(
                null, tenant, "Unidade Centro", "America/Sao_Paulo", true
        ));
        unitId = unit.getId();

        Customer customer = customerRepository.save(new Customer(
                null, tenant.getId(), "Cliente Teste", "cliente@comissao.dev", "11999999999", null, null
        ));
        customerId = customer.getId();

        User barberUser = userRepository.save(new User(
                null, "Barbeiro Teste", "barbeiro@comissao.dev",
                passwordEncoder.encode("senha-correta"),
                Role.BARBER, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));

        BarberProfile barberProfile = new BarberProfile();
        barberProfile.setUser(barberUser);
        barberProfile.setUnit(unit);
        barberProfile.setDisplayName("Barbeiro Teste");
        barberProfile.setDefaultCommissionPercent(40);
        barberProfile.setStatus(BarberStatus.ACTIVE);
        barberId = barberRepository.save(barberProfile).getId();
        barberToken = jwtService.generateTokemn(barberUser);

        ServiceOffering service = serviceOfferingRepository.save(new ServiceOffering(
                null, tenant.getId(), null, null, ServiceType.SERVICE,
                "Corte Masculino", null, 30, 0, 0,
                new BigDecimal("100.00"), 0, true
        ));
        serviceId = service.getId();

        User admin = userRepository.save(new User(
                null, "Admin", "admin@comissao.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));
        adminToken = jwtService.generateTokemn(admin);
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
    void provisionaComissaoComPercentualPadraoDoBarbeiroQuandoNaoHaRegra() throws Exception {
        String response = mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createAppointmentBody("2026-10-01T10:00:00")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(post("/appointments/{id}/confirm", id).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
        mockMvc.perform(post("/appointments/{id}/check-in", id).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
        mockMvc.perform(post("/appointments/{id}/start", id).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
        mockMvc.perform(post("/appointments/{id}/complete", id).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Serviço R$ 100, sem regra cadastrada -> cai no defaultCommissionPercent do barbeiro (40%) = R$ 40.
        // createdAt do lançamento é "agora" (momento da conclusão), não a data agendada do appointment.
        String hoje = LocalDate.now().toString();
        mockMvc.perform(get("/commissions/summary")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("from", hoje)
                        .param("to", hoje)
                        .param("barberId", barberId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.provisionedAmount").value("40.00"));
    }

    @Test
    void regraCadastradaTemPrecedenciaSobrePercentualPadrao() throws Exception {
        mockMvc.perform(post("/commission-rules")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "barberId": "%s",
                                  "type": "PERCENTAGE",
                                  "percentage": "60",
                                  "validFrom": "2026-01-01T00:00:00"
                                }
                                """.formatted(barberId)))
                .andExpect(status().isCreated());

        String response = mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createAppointmentBody("2026-10-02T10:00:00")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(post("/appointments/{id}/confirm", id).header("Authorization", "Bearer " + adminToken));
        mockMvc.perform(post("/appointments/{id}/check-in", id).header("Authorization", "Bearer " + adminToken));
        mockMvc.perform(post("/appointments/{id}/start", id).header("Authorization", "Bearer " + adminToken));
        mockMvc.perform(post("/appointments/{id}/complete", id).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Regra de 60% cadastrada prevalece sobre o defaultCommissionPercent (40%) -> R$ 60.
        String hoje = LocalDate.now().toString();
        mockMvc.perform(get("/commissions/summary")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("from", hoje)
                        .param("to", hoje)
                        .param("barberId", barberId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.provisionedAmount").value("60.00"));
    }

    @Test
    void barbeiroVeSomenteOProprioResumoIgnorandoBarberIdDaQuery() throws Exception {
        mockMvc.perform(get("/commissions/summary")
                        .header("Authorization", "Bearer " + barberToken)
                        .param("from", "2026-01-01")
                        .param("to", "2026-12-31")
                        .param("barberId", UUID.randomUUID().toString()))
                .andExpect(status().isOk());
        // Não lança 403/404 mesmo pedindo outro barberId — o controller ignora e força o próprio.
    }

    @Test
    void barbeiroNaoConsegueCriarRegraDeComissao() throws Exception {
        mockMvc.perform(post("/commission-rules")
                        .header("Authorization", "Bearer " + barberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"barberId": "%s", "type": "PERCENTAGE", "percentage": "60", "validFrom": "2026-01-01T00:00:00"}
                                """.formatted(barberId)))
                .andExpect(status().isForbidden());
    }

    @Test
    void ajusteManualExigeMotivoComTamanhoMinimo() throws Exception {
        mockMvc.perform(post("/commission-adjustments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"barberId": "%s", "amount": "10.00", "reason": "curto"}
                                """.formatted(barberId)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/commission-adjustments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"barberId": "%s", "amount": "-15.50", "reason": "Erro de lançamento no dia anterior"}
                                """.formatted(barberId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.commissionAmount").value("-15.50"))
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }
}
