package com.backend.barbers.auth;

import com.backend.auth.jwt.JwtService;
import com.backend.barbers.auth.dto.LoginRequest;
import com.backend.barbers.auth.dto.LoginResponse;
import com.backend.users.AuthProvider;
import com.backend.users.Role;
import com.backend.users.User;
import com.backend.users.UserRepository;
import com.backend.users.UserStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleIdTokenDecoder googleIdTokenDecoder;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       GoogleIdTokenDecoder googleIdTokenDecoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.googleIdTokenDecoder = googleIdTokenDecoder;
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

    public LoginResponse processSocialLogin(String idToken) {
        Jwt googleToken;
        try {
            googleToken = googleIdTokenDecoder.decode(idToken);
        } catch (JwtException exception) {
            throw new BadCredentialsException("Token do Google inválido");
        }

        String email = googleToken.getClaimAsString("email");
        String name = googleToken.getClaimAsString("name");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User(
                    UUID.randomUUID(),
                    name != null && !name.isBlank() ? name : email,
                    email,
                    passwordEncoder.encode(UUID.randomUUID().toString()),
                    Role.CLIENT,
                    UserStatus.ACTIVE,
                    null,
                    null,
                    null,
                    null
            );
            newUser.setProvider(AuthProvider.GOOGLE);
            return userRepository.save(newUser);
        });

        String accessToken = jwtService.generateTokemn(user);

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                accessToken,
                "Bearer",
                "Login com Google realizado com sucesso"
        );
    }
}
