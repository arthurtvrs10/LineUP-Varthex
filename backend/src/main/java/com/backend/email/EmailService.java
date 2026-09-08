package com.backend.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

// Cliente HTTP direto pra API do Resend (https://resend.com/docs/api-reference/emails/send-email)
// — sem SDK, é só um POST com Bearer auth. Sem RESEND_API_KEY configurada
// (dev local sem key, ou a suíte de testes), só loga e não tenta enviar:
// nunca finge que um e-mail foi entregue quando não foi.
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final RestClient restClient;
    private final String apiKey;
    private final String fromEmail;

    public EmailService(@Value("${resend.api-key:}") String apiKey,
                         @Value("${resend.from-email:onboarding@resend.dev}") String fromEmail) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .build();
    }

    public void sendPasswordRecoveryEmail(String to, String resetLink) {
        String subject = "Redefinição de senha — LINEUP";
        String html = """
                <p>Recebemos um pedido para redefinir sua senha no LINEUP.</p>
                <p><a href="%s">Clique aqui para criar uma nova senha</a></p>
                <p>Se você não pediu isso, pode ignorar este e-mail — sua senha continua a mesma.</p>
                <p>O link expira em 30 minutos.</p>
                """.formatted(resetLink);

        send(to, subject, html);
    }

    private void send(String to, String subject, String html) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("RESEND_API_KEY não configurada — e-mail para {} não foi enviado (assunto: {})", to, subject);
            return;
        }

        try {
            restClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "from", fromEmail,
                            "to", List.of(to),
                            "subject", subject,
                            "html", html
                    ))
                    .retrieve()
                    .toBodilessEntity();
            log.info("E-mail enviado via Resend para {} (assunto: {})", to, subject);
        } catch (Exception e) {
            // Falha de entrega não deve quebrar o fluxo pra quem pediu a
            // recuperação — RN-NOT-001/002 tratam isso como best-effort
            // neste incremento (sem fila/retry automático ainda).
            log.error("Falha ao enviar e-mail via Resend para {}: {}", to, e.getMessage());
        }
    }
}
