package com.backend.notifications;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class NotificationControllerTest {

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
    private String clientToken;
    private UUID unitId;
    private UUID customerId;
    private UUID barberId;
    private UUID serviceId;

    @BeforeEach
    void seed() {
        Tenant tenant = tenantRepository.save(new Tenant(
                null, "Barbearia Notificações", null, null,
                "America/Sao_Paulo", "pt-BR", "BRL", null, null
        ));
        Unit unit = unitRepository.save(new Unit(
                null, tenant, "Unidade Centro", "America/Sao_Paulo", true
        ));
        unitId = unit.getId();

        User clientUser = userRepository.save(new User(
                null, "Cliente Teste", "cliente@notificacoes.dev",
                passwordEncoder.encode("senha-correta"),
                Role.CLIENT, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));
        clientToken = jwtService.generateTokemn(clientUser);

        Customer customer = customerRepository.save(new Customer(
                null, tenant.getId(), "Cliente Teste", "cliente@notificacoes.dev", "11999999999", null, null
        ));
        customer.setUserId(clientUser.getId());
        customerId = customerRepository.save(customer).getId();

        User barberUser = userRepository.save(new User(
                null, "Barbeiro Teste", "barbeiro@notificacoes.dev",
                passwordEncoder.encode("senha-correta"),
                Role.BARBER, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));
        barberToken = jwtService.generateTokemn(barberUser);

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
                null, "Admin", "admin@notificacoes.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));
        adminToken = jwtService.generateTokemn(admin);
    }

    @Test
    void ciclDeVidaDoAgendamentoGeraNotificacoesParaBarbeiroECliente() throws Exception {
        String today = LocalDate.now().toString();

        String created = mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"unitId":"%s","customerId":"%s","barberId":"%s","startAt":"%sT09:00:00","channel":"ADMIN","items":[{"serviceId":"%s"}]}
                                """.formatted(unitId, customerId, barberId, today, serviceId)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String appointmentId = objectMapper.readTree(created).get("id").asText();

        // Criar o agendamento notifica o barbeiro, não o cliente.
        mockMvc.perform(get("/notifications").header("Authorization", "Bearer " + barberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("APPOINTMENT_CREATED"))
                .andExpect(jsonPath("$[0].title").value("Novo agendamento com você"))
                .andExpect(jsonPath("$[0].readAt").value(org.hamcrest.Matchers.nullValue()));

        mockMvc.perform(get("/notifications").header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(post("/appointments/{id}/confirm", appointmentId).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Confirmar notifica o cliente, não gera notificação nova pro barbeiro.
        mockMvc.perform(get("/notifications").header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("APPOINTMENT_CONFIRMED"))
                .andExpect(jsonPath("$[0].title").value("Agendamento confirmado"));

        mockMvc.perform(post("/appointments/{id}/cancel", appointmentId).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Cancelar notifica os dois: cliente (cancelado) e barbeiro (vaga liberada).
        mockMvc.perform(get("/notifications").header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("APPOINTMENT_CANCELED"))
                .andExpect(jsonPath("$[0].title").value("Agendamento cancelado"));

        mockMvc.perform(get("/notifications").header("Authorization", "Bearer " + barberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("APPOINTMENT_CANCELED"))
                .andExpect(jsonPath("$[0].title").value("Horário liberado"))
                .andExpect(jsonPath("$[1].title").value("Novo agendamento com você"));
    }

    @Test
    void marcarNotificacaoComoLidaSoFuncionaParaODonoDela() throws Exception {
        String today = LocalDate.now().toString();
        mockMvc.perform(post("/appointments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"unitId":"%s","customerId":"%s","barberId":"%s","startAt":"%sT09:00:00","channel":"ADMIN","items":[{"serviceId":"%s"}]}
                                """.formatted(unitId, customerId, barberId, today, serviceId)))
                .andExpect(status().isCreated());

        String list = mockMvc.perform(get("/notifications").header("Authorization", "Bearer " + barberToken))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String notificationId = objectMapper.readTree(list).get(0).get("id").asText();

        // Cliente não pode marcar como lida uma notificação que não é dele.
        mockMvc.perform(patch("/notifications/{id}/read", notificationId).header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(patch("/notifications/{id}/read", notificationId).header("Authorization", "Bearer " + barberToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/notifications").header("Authorization", "Bearer " + barberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].readAt").exists());
    }
}
