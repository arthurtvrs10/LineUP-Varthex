package com.backend.availability;

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
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AvailabilityControllerTest {

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
    private String otherBarberToken;
    private UUID barberId;
    private UUID serviceId;

    // Próxima segunda-feira a partir de hoje, sempre no futuro.
    private LocalDate nextMonday;

    @BeforeEach
    void seed() {
        Tenant tenant = tenantRepository.save(new Tenant(
                null, "Barbearia Disponibilidade", null, null,
                "America/Sao_Paulo", "pt-BR", "BRL", null, null
        ));
        Unit unit = unitRepository.save(new Unit(
                null, tenant, "Unidade Centro", "America/Sao_Paulo", true
        ));

        User barberUser = userRepository.save(new User(
                null, "Barbeiro Teste", "barbeiro@disponibilidade.dev",
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
        barberToken = jwtService.generateTokemn(barberUser);

        User otherBarberUser = userRepository.save(new User(
                null, "Outro Barbeiro", "outro@disponibilidade.dev",
                passwordEncoder.encode("senha-correta"),
                Role.BARBER, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));
        BarberProfile otherBarberProfile = new BarberProfile();
        otherBarberProfile.setUser(otherBarberUser);
        otherBarberProfile.setUnit(unit);
        otherBarberProfile.setDisplayName("Outro Barbeiro");
        otherBarberProfile.setDefaultCommissionPercent(0);
        otherBarberProfile.setStatus(BarberStatus.ACTIVE);
        barberRepository.save(otherBarberProfile);
        otherBarberToken = jwtService.generateTokemn(otherBarberUser);

        ServiceOffering service = serviceOfferingRepository.save(new ServiceOffering(
                null, tenant.getId(), null, null, ServiceType.SERVICE,
                "Corte Masculino", null, 60, 0, 0,
                new BigDecimal("50.00"), 0, true
        ));
        serviceId = service.getId();

        User admin = userRepository.save(new User(
                null, "Admin", "admin@disponibilidade.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, tenant.getId(),
                null, null, null
        ));
        adminToken = jwtService.generateTokemn(admin);

        LocalDate d = LocalDate.now().plusDays(1);
        while (d.getDayOfWeek() != DayOfWeek.MONDAY) {
            d = d.plusDays(1);
        }
        nextMonday = d;
    }

    @Test
    void adminDefineJornadaEBarbeiroConsultaDisponibilidade() throws Exception {
        mockMvc.perform(put("/barbers/{id}/work-schedules", barberId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                [{"weekday": 0, "startTime": "09:00:00", "endTime": "12:00:00"}]
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].weekday").value(0));

        // Jornada 09:00-12:00, serviço de 60min -> slots de hora em hora
        // (granularidade 15min), último slot possível às 11:00.
        mockMvc.perform(get("/barbers/{id}/availability", barberId)
                        .header("Authorization", "Bearer " + barberToken)
                        .param("date", nextMonday.toString())
                        .param("serviceId", serviceId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].startAt").value(nextMonday + "T09:00:00"))
                .andExpect(jsonPath("$[?(@.startAt == '" + nextMonday + "T11:00:00')]").exists())
                .andExpect(jsonPath("$[?(@.startAt == '" + nextMonday + "T11:15:00')]").doesNotExist());
    }

    @Test
    void diaSemJornadaNaoTemSlots() throws Exception {
        mockMvc.perform(get("/barbers/{id}/availability", barberId)
                        .header("Authorization", "Bearer " + barberToken)
                        .param("date", nextMonday.toString())
                        .param("serviceId", serviceId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void excecaoBloqueiaSlotsSobrepostos() throws Exception {
        mockMvc.perform(put("/barbers/{id}/work-schedules", barberId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                [{"weekday": 0, "startTime": "09:00:00", "endTime": "11:00:00"}]
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(post("/barbers/{id}/availability-exceptions", barberId)
                        .header("Authorization", "Bearer " + barberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"type": "BLOCK", "startsAt": "%sT09:00:00", "endsAt": "%sT10:00:00", "reason": "Compromisso pessoal"}
                                """.formatted(nextMonday, nextMonday)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/barbers/{id}/availability", barberId)
                        .header("Authorization", "Bearer " + barberToken)
                        .param("date", nextMonday.toString())
                        .param("serviceId", serviceId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.startAt == '" + nextMonday + "T09:00:00')]").doesNotExist())
                .andExpect(jsonPath("$[?(@.startAt == '" + nextMonday + "T10:00:00')]").exists());
    }

    @Test
    void barbeiroNaoConsegueEditarJornadaDeOutroBarbeiro() throws Exception {
        mockMvc.perform(put("/barbers/{id}/work-schedules", barberId)
                        .header("Authorization", "Bearer " + otherBarberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                [{"weekday": 0, "startTime": "09:00:00", "endTime": "12:00:00"}]
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void faixasSobrepostasNoMesmoDiaSaoRejeitadas() throws Exception {
        mockMvc.perform(put("/barbers/{id}/work-schedules", barberId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                [
                                  {"weekday": 0, "startTime": "09:00:00", "endTime": "12:00:00"},
                                  {"weekday": 0, "startTime": "11:00:00", "endTime": "14:00:00"}
                                ]
                                """))
                .andExpect(status().isBadRequest());
    }
}
