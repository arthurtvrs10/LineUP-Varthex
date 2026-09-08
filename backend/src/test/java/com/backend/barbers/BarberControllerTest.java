package com.backend.barbers;

import com.backend.auth.jwt.JwtService;
import com.backend.tenants.Tenant;
import com.backend.tenants.TenantRepository;
import com.backend.units.Unit;
import com.backend.units.UnitRepository;
import com.backend.users.Role;
import com.backend.users.User;
import com.backend.users.UserRepository;
import com.backend.users.UserStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BarberControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private BarberRepository barberRepository;

    @Test
    void barbeiroConsultaOProprioPerfilPorMe() throws Exception {
        Tenant tenant = tenantRepository.save(new Tenant(
                null, "Barbearia Teste", null, null,
                "America/Sao_Paulo", "pt-BR", "BRL", null, null
        ));
        Unit unit = unitRepository.save(new Unit(
                null, tenant, "Unidade Centro", "America/Sao_Paulo", true
        ));

        User barberUser = userRepository.save(new User(
                null, "Barbeiro Teste", "barbeiro.me@barbers.dev",
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
        BarberProfile saved = barberRepository.save(barberProfile);

        String token = jwtService.generateTokemn(barberUser);

        mockMvc.perform(get("/barbers/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId().toString()))
                .andExpect(jsonPath("$.unitId").value(unit.getId().toString()))
                .andExpect(jsonPath("$.displayName").value("Barbeiro Teste"));
    }

    @Test
    void usuarioSemPerfilDeBarbeiroRecebe404EmMe() throws Exception {
        User admin = userRepository.save(new User(
                null, "Admin sem perfil", "admin.sem.perfil@barbers.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, null,
                null, null, null
        ));
        String token = jwtService.generateTokemn(admin);

        mockMvc.perform(get("/barbers/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }
}
