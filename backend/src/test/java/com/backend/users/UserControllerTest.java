package com.backend.users;

import com.backend.auth.jwt.JwtService;
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

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserControllerTest {

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

    private UUID tenantA;
    private UUID tenantB;
    private String tokenAdminA;
    private String tokenSuperAdmin;
    private User clienteB;

    @BeforeEach
    void seed() {
        tenantA = UUID.randomUUID();
        tenantB = UUID.randomUUID();

        User adminA = userRepository.save(new User(
                null, "Admin A", "admin.a@isolamento.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, tenantA,
                null, null, null
        ));
        clienteB = userRepository.save(new User(
                null, "Cliente B", "cliente.b@isolamento.dev",
                passwordEncoder.encode("senha-correta"),
                Role.CLIENT, UserStatus.ACTIVE, tenantB,
                null, null, null
        ));
        User superAdmin = userRepository.save(new User(
                null, "Super Admin", "super@isolamento.dev",
                passwordEncoder.encode("senha-correta"),
                Role.SUPER_ADMIN, UserStatus.ACTIVE, null,
                null, null, null
        ));

        tokenAdminA = jwtService.generateTokemn(adminA);
        tokenSuperAdmin = jwtService.generateTokemn(superAdmin);
    }

    @Test
    void adminNaoVeUsuarioDeOutroTenant() throws Exception {
        mockMvc.perform(get("/users/{id}", clienteB.getId())
                        .header("Authorization", "Bearer " + tokenAdminA))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminNaoListaUsuarioDeOutroTenant() throws Exception {
        mockMvc.perform(get("/users").header("Authorization", "Bearer " + tokenAdminA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email == 'cliente.b@isolamento.dev')]").isEmpty());
    }

    @Test
    void adminNaoConsegueCriarSuperAdmin() throws Exception {
        mockMvc.perform(post("/users")
                        .header("Authorization", "Bearer " + tokenAdminA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Invasor","email":"invasor@isolamento.dev","password":"senha-correta","role":"SUPER_ADMIN"}
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCriaUsuarioSemInformarTenantEVaiPraProprioTenant() throws Exception {
        String response = mockMvc.perform(post("/users")
                        .header("Authorization", "Bearer " + tokenAdminA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Barbeiro Novo","email":"barbeiro.novo@isolamento.dev","password":"senha-correta","role":"BARBER"}
                                """))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        assertEqualsTenant(tenantA, json.get("tenantId").asText());
    }

    @Test
    void adminNaoConsegueBloquearUsuarioDeOutroTenant() throws Exception {
        mockMvc.perform(patch("/users/{id}/block", clienteB.getId())
                        .header("Authorization", "Bearer " + tokenAdminA))
                .andExpect(status().isForbidden());
    }

    @Test
    void superAdminVeECriaEmQualquerTenant() throws Exception {
        mockMvc.perform(get("/users/{id}", clienteB.getId())
                        .header("Authorization", "Bearer " + tokenSuperAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("cliente.b@isolamento.dev"));

        mockMvc.perform(post("/users")
                        .header("Authorization", "Bearer " + tokenSuperAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Outro Super","email":"outro.super@isolamento.dev","password":"senha-correta","role":"SUPER_ADMIN"}
                                """))
                .andExpect(status().isOk());
    }

    private void assertEqualsTenant(UUID expected, String actual) {
        org.junit.jupiter.api.Assertions.assertEquals(expected.toString(), actual);
    }
}
