package com.backend.barbers.auth;

import com.backend.users.Role;
import com.backend.users.User;
import com.backend.users.UserRepository;
import com.backend.users.UserStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthSessionAndLockoutTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private void criarUsuario(String email) {
        userRepository.save(new User(
                null, "Usuário Sessão", email,
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, null,
                null, null, null
        ));
    }

    private String login(String email) throws Exception {
        String response = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"senha-correta"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return response;
    }

    @Test
    void refreshRotacionaOTokenEInvalidaOAnterior() throws Exception {
        criarUsuario("refresh@auth.dev");
        String loginResponse = login("refresh@auth.dev");
        String refreshToken = objectMapper.readTree(loginResponse).get("refreshToken").asText();

        String refreshResponse = mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"%s"}
                                """.formatted(refreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andReturn().getResponse().getContentAsString();

        String novoRefreshToken = objectMapper.readTree(refreshResponse).get("refreshToken").asText();
        org.junit.jupiter.api.Assertions.assertNotEquals(refreshToken, novoRefreshToken);

        // O token antigo já foi rotacionado — usar de novo tem que falhar.
        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"%s"}
                                """.formatted(refreshToken)))
                .andExpect(status().isUnauthorized());

        // O novo token ainda funciona.
        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"%s"}
                                """.formatted(novoRefreshToken)))
                .andExpect(status().isOk());
    }

    @Test
    void logoutRevogaORefreshToken() throws Exception {
        criarUsuario("logout@auth.dev");
        String loginResponse = login("logout@auth.dev");
        String refreshToken = objectMapper.readTree(loginResponse).get("refreshToken").asText();

        mockMvc.perform(post("/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"%s"}
                                """.formatted(refreshToken)))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"%s"}
                                """.formatted(refreshToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listarERevogarSessoesEALogoutAll() throws Exception {
        criarUsuario("sessoes@auth.dev");
        String login1 = login("sessoes@auth.dev");
        String login2 = login("sessoes@auth.dev");
        String accessToken = objectMapper.readTree(login2).get("accessToken").asText();

        mockMvc.perform(get("/auth/sessions").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        String sessionsResponse = mockMvc.perform(get("/auth/sessions").header("Authorization", "Bearer " + accessToken))
                .andReturn().getResponse().getContentAsString();
        String sessionId = objectMapper.readTree(sessionsResponse).get(0).get("id").asText();

        mockMvc.perform(delete("/auth/sessions/{id}", sessionId).header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/auth/sessions").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(post("/auth/logout-all").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/auth/sessions").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void cincoTentativasErradasBloqueiaAContaTemporariamente() throws Exception {
        criarUsuario("lockout@auth.dev");

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"lockout@auth.dev","password":"senha-errada"}
                                    """))
                    .andExpect(status().isUnauthorized());
        }

        // Mesmo com a senha certa agora, a conta está bloqueada.
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"lockout@auth.dev","password":"senha-correta"}
                                """))
                .andExpect(status().isTooManyRequests());
    }
}
