package com.backend.auth.jwt;

import com.backend.users.User;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class JwtService {
    private final JwtEncoder jwtEncoder;

    public JwtService(JwtEncoder jwtEncoder){
        this.jwtEncoder = jwtEncoder;
    }

    public String generateTokemn(User user) {
        Instant now = Instant.now();

        JwtClaimsSet.Builder claimsBuilder = JwtClaimsSet.builder()
                .issuer("varthex-barber")
                .issuedAt(now)
                // Ainda não existe fluxo de refresh token — o token de acesso
                // precisa durar o suficiente para cobrir uma sessão de trabalho
                // sem exigir novo login no meio do expediente.
                .expiresAt(now.plus(12, ChronoUnit.HOURS))
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name());

        if (user.getTenantId() != null) {
            claimsBuilder.claim(
                    "tenantId",
                    user.getTenantId().toString()
            );
        }

        JwtClaimsSet claims = claimsBuilder.build();

        return jwtEncoder.encode(
             JwtEncoderParameters.from(claims)
        ).getTokenValue();
    }
}
