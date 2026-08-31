package com.backend.auth;

import com.backend.auth.dto.LoginRequest;
import com.backend.auth.dto.LoginResponse;
import com.backend.auth.dto.MeResponse;
import com.backend.users.Role;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request){
        return authService.login(request);
    }

    @GetMapping("/me")
    public MeResponse me(JwtAuthenticationToken authentication){
        Jwt jwt = authentication.getToken();

        String barbershopIdClaim =
                jwt.getClaimAsString("barbershopId");

        UUID barbershopId = barbershopIdClaim != null
                ? UUID.fromString(barbershopIdClaim)
                : null;

        return new MeResponse(
                UUID.fromString(jwt.getSubject()),
                jwt.getClaimAsString("email"),
                Role.valueOf(jwt.getClaimAsString("role")),
                barbershopId
        );
    }
}

