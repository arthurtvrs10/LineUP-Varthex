package com.backend.customers;

import com.backend.auth.jwt.JwtService;
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

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CustomerControllerTest {

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

    private String tokenTenantA;
    private String tokenTenantB;

    @BeforeEach
    void seedAdmins() {
        UUID tenantA = UUID.randomUUID();
        UUID tenantB = UUID.randomUUID();

        User adminA = userRepository.save(new User(
                null, "Admin A", "admin.a@customers.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, tenantA,
                null, null, null
        ));
        User adminB = userRepository.save(new User(
                null, "Admin B", "admin.b@customers.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, tenantB,
                null, null, null
        ));

        tokenTenantA = jwtService.generateTokemn(adminA);
        tokenTenantB = jwtService.generateTokemn(adminB);
    }

    private String createCustomerBody(String name) {
        return """
                {"fullName":"%s","email":"cliente@exemplo.dev","version":0}
                """.formatted(name);
    }

    @Test
    void criaClienteComNomeESemContatoRetorna400() throws Exception {
        mockMvc.perform(post("/customers")
                        .header("Authorization", "Bearer " + tokenTenantA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Sem Contato","version":0}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void criaEBuscaCliente() throws Exception {
        String response = mockMvc.perform(post("/customers")
                        .header("Authorization", "Bearer " + tokenTenantA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createCustomerBody("Cliente Um")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fullName").value("Cliente Um"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(get("/customers/{id}", id)
                        .header("Authorization", "Bearer " + tokenTenantA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Cliente Um"));
    }

    @Test
    void clienteDeUmTenantNaoApareceParaOutroTenant() throws Exception {
        String response = mockMvc.perform(post("/customers")
                        .header("Authorization", "Bearer " + tokenTenantA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createCustomerBody("Cliente Isolado")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(get("/customers/{id}", id)
                        .header("Authorization", "Bearer " + tokenTenantB))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/customers")
                        .header("Authorization", "Bearer " + tokenTenantB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty());
    }

    @Test
    void atualizaClienteComVersaoDivergenteRetorna409() throws Exception {
        String response = mockMvc.perform(post("/customers")
                        .header("Authorization", "Bearer " + tokenTenantA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createCustomerBody("Cliente Versionado")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        String id = json.get("id").asText();

        mockMvc.perform(patch("/customers/{id}", id)
                        .header("Authorization", "Bearer " + tokenTenantA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Nome Novo","email":"cliente@exemplo.dev","version":99}
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    void arquivaCliente() throws Exception {
        String response = mockMvc.perform(post("/customers")
                        .header("Authorization", "Bearer " + tokenTenantA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createCustomerBody("Cliente a Arquivar")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(delete("/customers/{id}", id)
                        .header("Authorization", "Bearer " + tokenTenantA))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/customers/{id}", id)
                        .header("Authorization", "Bearer " + tokenTenantA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ARCHIVED"));
    }
}
