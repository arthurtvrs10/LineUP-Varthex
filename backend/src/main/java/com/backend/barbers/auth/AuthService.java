package com.backend.auth;

import com.backend.auth.dto.LoginRequest;
import com.backend.auth.dto.LoginResponse;
import com.backend.auth.jwt.JwtService;
import com.backend.users.User;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request){
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        AuthUserDetails authUserDetails = (AuthUserDetails) authentication.getPrincipal();

        User user = authUserDetails.getUser();
        String accessToken = jwtService.generateTokemn(user);

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                accessToken,
                "Bearer",
                "Login realizado com sucesso"
        );

    }
}
