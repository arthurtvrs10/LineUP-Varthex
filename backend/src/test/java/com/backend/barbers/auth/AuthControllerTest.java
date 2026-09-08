package com.backend.barbers.auth;

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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Test
    void loginComCredenciaisInvalidasRetorna401() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"ninguem@lineup.dev","password":"senha-errada"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void socialLoginComTokenGoogleForjadoRetorna401() throws Exception {
        // "idToken" com formato de JWT, mas assinatura/claims que não batem
        // com nenhuma chave pública real do Google — deve ser rejeitado
        // antes de qualquer criação/login de usuário.
        String tokenForjado =
                "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFkbWluQGV4ZW1wbG8uY29tIn0.assinatura-invalida";

        mockMvc.perform(post("/auth/social-login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"idToken":"%s"}
                                """.formatted(tokenForjado)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meRetornaNomeDoUsuarioAutenticado() throws Exception {
        User admin = userRepository.save(new User(
                null, "Admin do Teste", "admin.me@auth.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, null,
                null, null, null
        ));
        String token = jwtService.generateTokemn(admin);

        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Admin do Teste"))
                .andExpect(jsonPath("$.email").value("admin.me@auth.dev"));
    }
}
