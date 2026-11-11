package com.backend.auth.jwt;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

class JwtConfigTest {
    @Test
    void rejectsShortSigningKeys() {
        assertThrows(IllegalArgumentException.class, () -> new JwtConfig().secretKey("short"));
    }

    @Test
    void deploymentKeySignsTokensAndAnotherKeyCannotVerifyThem() {
        var config = new JwtConfig();
        var key = config.secretKey("test-only-signing-key-with-at-least-32-bytes");
        var claims = JwtClaimsSet.builder().subject("test-user")
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60)).build();
        var token = config.jwtEncoder(key).encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        assertEquals("test-user", config.jwtDecoder(key).decode(token).getSubject());
        var other = config.secretKey("different-test-only-key-with-at-least-32-bytes");
        assertThrows(JwtException.class, () -> config.jwtDecoder(other).decode(token));
    }
}
