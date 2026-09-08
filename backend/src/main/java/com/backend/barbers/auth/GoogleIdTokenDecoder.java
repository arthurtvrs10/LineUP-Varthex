package com.backend.barbers.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

/**
 * Valida o ID token assinado pelo Google (recebido do NextAuth no frontend)
 * contra as chaves públicas do Google antes de confiar em qualquer claim.
 * Sem isso, o endpoint de social login aceitaria e-mail/nome forjados por
 * qualquer chamador e permitiria autenticar como qualquer usuário.
 */
@Component
public class GoogleIdTokenDecoder {

    private static final Set<String> VALID_ISSUERS = Set.of(
            "https://accounts.google.com", "accounts.google.com"
    );

    private final JwtDecoder delegate;

    public GoogleIdTokenDecoder(@Value("${google.client-id:}") String googleClientId) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withJwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
                .build();

        OAuth2TokenValidator<Jwt> validator = new DelegatingOAuth2TokenValidator<>(List.of(
                new JwtTimestampValidator(),
                new JwtClaimValidator<String>("iss", VALID_ISSUERS::contains),
                // O claim "aud" é sempre normalizado pelo Spring/Nimbus como
                // List<String> (o JWT pode ter uma ou várias audiências) —
                // validar como String direto derruba todo login do Google
                // com ClassCastException.
                new JwtClaimValidator<List<String>>("aud", auds -> auds != null && auds.contains(googleClientId)),
                new JwtClaimValidator<Boolean>("email_verified", Boolean.TRUE::equals)
        ));
        decoder.setJwtValidator(validator);

        this.delegate = decoder;
    }

    public Jwt decode(String idToken) {
        return delegate.decode(idToken);
    }
}
