package com.backend.services;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ServiceOfferingControllerTest {
    @Autowired private com.backend.tenants.TenantRepository tenantRepository;

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

    private String token;

    @Test
    void categoriasValidamNomeEDuplicidade() throws Exception {
        for (String name : new String[]{"", "   ", "a".repeat(121)}) {
            mockMvc.perform(post("/service-categories").header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(java.util.Map.of("name", name))))
                    .andExpect(status().isBadRequest());
        }
        mockMvc.perform(post("/service-categories").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"  Cortes  \"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.name").value("Cortes"));
        mockMvc.perform(post("/service-categories").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"cORTES\"}"))
                .andExpect(status().isConflict());
        mockMvc.perform(get("/service-categories").header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void categoriasSaoIsoladasPorBarbearia() throws Exception {
        UUID otherTenant = tenantRepository.save(new com.backend.tenants.Tenant(null, "Outra", null, null, "America/Sao_Paulo", "pt-BR", "BRL", null, null)).getId();
        User other = userRepository.save(new User(null, "Outro Admin", "other@services.dev", passwordEncoder.encode("senha-correta"), Role.ADMIN, UserStatus.ACTIVE, otherTenant, null, null, null));
        String otherToken = jwtService.generateTokemn(other);
        String response = mockMvc.perform(post("/service-categories").header("Authorization", "Bearer " + token)
                .header("X-Barbershop-Id", otherTenant).contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Cortes\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        mockMvc.perform(get("/service-categories").header("Authorization", "Bearer " + otherToken))
                .andExpect(jsonPath("$.length()").value(0));
        mockMvc.perform(post("/service-categories").header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Cortes\"}"))
                .andExpect(status().isCreated());
        String foreignId = objectMapper.readTree(response).get("id").asText();
        mockMvc.perform(post("/services").header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON).content(CREATE_SERVICE_BODY.replace("\"serviceType\"", "\"categoryId\":\"" + foreignId + "\",\"serviceType\"")))
                .andExpect(status().isBadRequest());
    }

    @BeforeEach
    void seedAdmin() {
        UUID tenantId = tenantRepository.save(new com.backend.tenants.Tenant(null, "Empresa Teste", null, null, "America/Sao_Paulo", "pt-BR", "BRL", null, null)).getId();

        User admin = userRepository.save(new User(
                null, "Admin", "admin@services.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, tenantId,
                null, null, null
        ));

        token = jwtService.generateTokemn(admin);
    }

    private static final String CREATE_SERVICE_BODY = """
            {
              "serviceType": "SERVICE",
              "name": "Corte Masculino",
              "durationMinutes": 30,
              "bufferBeforeMinutes": 0,
              "bufferAfterMinutes": 5,
              "price": "49.90",
              "sortOrder": 0,
              "active": true,
              "version": 0
            }
            """;

    @Test
    void criaServicoComPrecoInvalidoRetorna400() throws Exception {
        mockMvc.perform(post("/services")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "serviceType": "SERVICE",
                                  "name": "Corte",
                                  "durationMinutes": 30,
                                  "bufferBeforeMinutes": 0,
                                  "bufferAfterMinutes": 0,
                                  "price": "não-é-preco",
                                  "sortOrder": 0,
                                  "version": 0
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void criaListaEAtualizaServico() throws Exception {
        String response = mockMvc.perform(post("/services")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CREATE_SERVICE_BODY))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Corte Masculino"))
                .andExpect(jsonPath("$.price").value("49.90"))
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(get("/services").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Corte Masculino"));

        mockMvc.perform(patch("/services/{id}", id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "serviceType": "SERVICE",
                                  "name": "Corte Masculino Premium",
                                  "durationMinutes": 40,
                                  "bufferBeforeMinutes": 0,
                                  "bufferAfterMinutes": 5,
                                  "price": "59.90",
                                  "sortOrder": 0,
                                  "active": true,
                                  "version": 0
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Corte Masculino Premium"))
                .andExpect(jsonPath("$.price").value("59.90"));
    }

    @Test
    void atualizaServicoComVersaoDivergenteRetorna409() throws Exception {
        String response = mockMvc.perform(post("/services")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CREATE_SERVICE_BODY))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        String id = json.get("id").asText();

        mockMvc.perform(patch("/services/{id}", id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "serviceType": "SERVICE",
                                  "name": "Corte",
                                  "durationMinutes": 30,
                                  "bufferBeforeMinutes": 0,
                                  "bufferAfterMinutes": 0,
                                  "price": "10.00",
                                  "sortOrder": 0,
                                  "active": true,
                                  "version": 99
                                }
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    void criaCategoriaEVinculaServico() throws Exception {
        String categoryResponse = mockMvc.perform(post("/service-categories")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Cortes","sortOrder":0,"active":true,"version":0}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String categoryId = objectMapper.readTree(categoryResponse).get("id").asText();

        mockMvc.perform(post("/services")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "categoryId": "%s",
                                  "serviceType": "SERVICE",
                                  "name": "Corte Masculino",
                                  "durationMinutes": 30,
                                  "bufferBeforeMinutes": 0,
                                  "bufferAfterMinutes": 5,
                                  "price": "49.90",
                                  "sortOrder": 0,
                                  "active": true,
                                  "version": 0
                                }
                                """.formatted(categoryId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.categoryId").value(categoryId));
    }
}
