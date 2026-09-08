package com.backend.tenants;

import com.backend.auth.jwt.JwtService;
import com.backend.users.Role;
import com.backend.users.User;
import com.backend.users.UserRepository;
import com.backend.users.UserStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TenantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private static final String CREATE_BODY = """
            {
              "tradeName": "Barbearia do Zé",
              "defaultTimeZone": "America/Sao_Paulo",
              "locale": "pt-BR",
              "currency": "BRL",
              "admin": {
                "email": "ze@barbearia.dev",
                "fullName": "Ze Admin",
                "role": "ADMIN"
              },
              "initialUnit": {
                "name": "Unidade Centro",
                "timeZone": "America/Sao_Paulo",
                "country": "BR",
                "active": true
              }
            }
            """;

    @Test
    void criaTenantUnidadeEAdminAtomicamente() throws Exception {
        mockMvc.perform(post("/tenants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CREATE_BODY))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tradeName").value("Barbearia do Zé"))
                .andExpect(jsonPath("$.status").value("TRIAL"))
                .andExpect(jsonPath("$.id").isNotEmpty());
    }

    @Test
    void criarTenantComEmailJaCadastradoRetorna409() throws Exception {
        mockMvc.perform(post("/tenants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CREATE_BODY))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/tenants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CREATE_BODY))
                .andExpect(status().isConflict());
    }

    @Test
    void adminCriadoConsegueVerOTenantEAUnidadeCriados() throws Exception {
        mockMvc.perform(post("/tenants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CREATE_BODY))
                .andExpect(status().isCreated());

        // O admin criado não tem senha conhecida (ainda não existe fluxo de
        // convite/definição de senha) — mintamos o JWT dele diretamente,
        // do mesmo jeito que AuthService faria após um login real, só para
        // provar que /tenant e /unit resolvem o contexto certo pelo claim.
        User admin = userRepository.findByEmail("ze@barbearia.dev").orElseThrow();
        String token = jwtService.generateTokemn(admin);

        mockMvc.perform(get("/tenant")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tradeName").value("Barbearia do Zé"));

        mockMvc.perform(get("/unit")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Unidade Centro"));
    }

    @Test
    void getTenantSemAutenticacaoRetorna401() throws Exception {
        mockMvc.perform(get("/tenant"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void patchTenantSemAutenticacaoRetorna401() throws Exception {
        mockMvc.perform(patch("/tenant")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void superAdminListaTenantsEAtualizaStatus() throws Exception {
        String response = mockMvc.perform(post("/tenants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CREATE_BODY))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String tenantId = objectMapper.readTree(response).get("id").asText();

        User superAdmin = userRepository.save(new User(
                null, "Super Admin", "super@tenants.dev", "x",
                Role.SUPER_ADMIN, UserStatus.ACTIVE, null,
                null, null, null
        ));
        String token = jwtService.generateTokemn(superAdmin);

        mockMvc.perform(get("/tenants").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == '" + tenantId + "')]").isNotEmpty());

        mockMvc.perform(patch("/tenants/{id}/status", tenantId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"SUSPENDED"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUSPENDED"));
    }

    @Test
    void adminNaoConsegueListarTenantsNemMudarStatus() throws Exception {
        String response = mockMvc.perform(post("/tenants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CREATE_BODY))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String tenantId = objectMapper.readTree(response).get("id").asText();
        User admin = userRepository.findByEmail("ze@barbearia.dev").orElseThrow();
        String token = jwtService.generateTokemn(admin);

        mockMvc.perform(get("/tenants").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        mockMvc.perform(patch("/tenants/{id}/status", tenantId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"SUSPENDED"}
                                """))
                .andExpect(status().isForbidden());
    }
}
