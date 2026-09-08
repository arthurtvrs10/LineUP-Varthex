package com.backend.notifications;

import com.backend.auth.jwt.JwtService;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class NotificationPreferenceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private String token() {
        User user = userRepository.save(new User(
                null, "Cliente Preferências", "prefs@notificacoes.dev",
                passwordEncoder.encode("senha-correta"),
                Role.CLIENT, UserStatus.ACTIVE, null,
                null, null, null
        ));
        return jwtService.generateTokemn(user);
    }

    @Test
    void listaPreferenciasComDefaultHabilitadoEMarcaObrigatorias() throws Exception {
        mockMvc.perform(get("/notification-preferences").header("Authorization", "Bearer " + token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.type=='APPOINTMENT_CONFIRMED')].mandatory").value(true))
                .andExpect(jsonPath("$[?(@.type=='APPOINTMENT_CONFIRMED')].emailEnabled").value(true))
                .andExpect(jsonPath("$[?(@.type=='WAITLIST_OFFER')].mandatory").value(false))
                .andExpect(jsonPath("$[?(@.type=='WAITLIST_OFFER')].emailEnabled").value(true));
    }

    @Test
    void desligaPreferenciaNaoObrigatoriaEPersiste() throws Exception {
        String authToken = token();

        mockMvc.perform(put("/notification-preferences")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                [{"type":"WAITLIST_OFFER","emailEnabled":false}]
                                """))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/notification-preferences").header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.type=='WAITLIST_OFFER')].emailEnabled").value(false));
    }

    @Test
    void naoConsegueDesligarPreferenciaObrigatoria() throws Exception {
        String authToken = token();

        mockMvc.perform(put("/notification-preferences")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                [{"type":"APPOINTMENT_CONFIRMED","emailEnabled":false}]
                                """))
                .andExpect(status().isNoContent());

        // A tentativa é ignorada silenciosamente — continua habilitado.
        mockMvc.perform(get("/notification-preferences").header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.type=='APPOINTMENT_CONFIRMED')].emailEnabled").value(true));
    }
}
