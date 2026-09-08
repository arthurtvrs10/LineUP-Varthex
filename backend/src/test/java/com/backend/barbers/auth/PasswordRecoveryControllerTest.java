package com.backend.barbers.auth;

import com.backend.auth.jwt.JwtService;
import com.backend.email.EmailService;
import com.backend.users.Role;
import com.backend.users.User;
import com.backend.users.UserRepository;
import com.backend.users.UserStatus;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.Mockito.verify;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PasswordRecoveryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @MockitoBean
    private EmailService emailService;

    @Test
    void fluxoFelizCompletoDeRecuperacaoDeSenha() throws Exception {
        userRepository.save(new User(
                null, "Cliente Feliz", "feliz@auth.dev",
                passwordEncoder.encode("senha-antiga"),
                Role.CLIENT, UserStatus.ACTIVE, null,
                null, null, null
        ));

        mockMvc.perform(post("/auth/password-recovery")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"feliz@auth.dev"}
                                """))
                .andExpect(status().isOk());

        ArgumentCaptor<String> linkCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendPasswordRecoveryEmail(org.mockito.ArgumentMatchers.eq("feliz@auth.dev"), linkCaptor.capture());

        String link = linkCaptor.getValue();
        String rawToken = URLDecoder.decode(link.substring(link.indexOf("token=") + "token=".length()), StandardCharsets.UTF_8);

        mockMvc.perform(post("/auth/password-recovery/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"%s","newPassword":"senha-recuperada-123"}
                                """.formatted(rawToken)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"feliz@auth.dev","password":"senha-recuperada-123"}
                                """))
                .andExpect(status().isOk());

        // Token de uso único: usar de novo falha.
        mockMvc.perform(post("/auth/password-recovery/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"%s","newPassword":"outra-senha-456"}
                                """.formatted(rawToken)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void solicitarRecuperacaoParaEmailInexistenteAindaAssimRetorna200() throws Exception {
        // RF-AUT-005: nunca revela se o e-mail existe.
        mockMvc.perform(post("/auth/password-recovery")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"ninguem@recuperacao.dev"}
                                """))
                .andExpect(status().isOk());
    }

    @Test
    void solicitarRecuperacaoPersisteTokenComExpiracaoFutura() throws Exception {
        User user = userRepository.save(new User(
                null, "Cliente Recuperação", "recuperar@auth.dev",
                passwordEncoder.encode("senha-antiga"),
                Role.CLIENT, UserStatus.ACTIVE, null,
                null, null, null
        ));

        mockMvc.perform(post("/auth/password-recovery")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"recuperar@auth.dev"}
                                """))
                .andExpect(status().isOk());

        PasswordResetToken stored = passwordResetTokenRepository.findAll().stream()
                .filter(t -> t.getUserId().equals(user.getId()))
                .findFirst()
                .orElseThrow();

        org.junit.jupiter.api.Assertions.assertTrue(stored.getExpiresAt().isAfter(LocalDateTime.now()));
        org.junit.jupiter.api.Assertions.assertNull(stored.getUsedAt());
    }

    @Test
    void completarRecuperacaoComTokenInexistenteRetorna400() throws Exception {
        mockMvc.perform(post("/auth/password-recovery/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"token-que-nao-existe","newPassword":"senha-nova-123"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void trocaDeSenhaAutenticadaExigeSenhaAtualCorreta() throws Exception {
        User user = userRepository.save(new User(
                null, "Usuário Troca", "troca@auth.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, null,
                null, null, null
        ));
        String token = jwtService.generateTokemn(user);

        mockMvc.perform(patch("/auth/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"currentPassword":"senha-errada","newPassword":"nova-senha-123"}
                                """))
                .andExpect(status().isBadRequest());

        mockMvc.perform(patch("/auth/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"currentPassword":"senha-correta","newPassword":"nova-senha-123"}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"troca@auth.dev","password":"nova-senha-123"}
                                """))
                .andExpect(status().isOk());
    }

    @Test
    void novaSenhaCurtaDemaisERejeitada() throws Exception {
        User user = userRepository.save(new User(
                null, "Usuário Senha Curta", "curta@auth.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, null,
                null, null, null
        ));
        String token = jwtService.generateTokemn(user);

        mockMvc.perform(patch("/auth/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"currentPassword":"senha-correta","newPassword":"123"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void trocarSenhaSemAutenticacaoRetorna401() throws Exception {
        mockMvc.perform(patch("/auth/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"currentPassword":"x","newPassword":"nova-senha-123"}
                                """))
                .andExpect(status().isUnauthorized());
    }
}
