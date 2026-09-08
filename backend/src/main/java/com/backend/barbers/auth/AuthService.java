package com.backend.barbers.auth;

import com.backend.auth.jwt.JwtService;
import com.backend.barbers.auth.dto.LoginRequest;
import com.backend.barbers.auth.dto.LoginResponse;
import com.backend.customers.Customer;
import com.backend.customers.CustomerRepository;
import com.backend.email.EmailService;
import com.backend.users.AuthProvider;
import com.backend.users.Role;
import com.backend.users.User;
import com.backend.users.UserRepository;
import com.backend.users.UserStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
public class AuthService {

    private static final int RESET_TOKEN_VALID_MINUTES = 30;

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleIdTokenDecoder googleIdTokenDecoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final String frontendUrl;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UserRepository userRepository,
                       CustomerRepository customerRepository,
                       PasswordEncoder passwordEncoder,
                       GoogleIdTokenDecoder googleIdTokenDecoder,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       EmailService emailService,
                       @Value("${app.frontend-url:http://localhost:3000}") String frontendUrl) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.googleIdTokenDecoder = googleIdTokenDecoder;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public LoginResponse login(LoginRequest request){
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        AuthUserDetails authUserDetails = (AuthUserDetails) authentication.getPrincipal();

        User user = linkCustomerIfNeeded(authUserDetails.getUser());
        String accessToken = jwtService.generateTokemn(user);

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                accessToken,
                "Bearer",
                "Login realizado com sucesso"
        );

    }

    @Transactional
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

        user = linkCustomerIfNeeded(user);
        String accessToken = jwtService.generateTokemn(user);

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                accessToken,
                "Bearer",
                "Login com Google realizado com sucesso"
        );
    }

    // RF-AUT-005: nunca revela se o e-mail existe — sempre "sucesso" do
    // ponto de vista de quem chamou, mesmo que nenhum e-mail seja enviado.
    @Transactional
    public void requestPasswordRecovery(String email) {
        if (email == null || email.isBlank()) {
            return;
        }

        userRepository.findByEmail(email).ifPresent(user -> {
            String rawToken = generateRawToken();
            String tokenHash = hashToken(rawToken);

            PasswordResetToken resetToken = new PasswordResetToken(
                    user.getId(), tokenHash, LocalDateTime.now().plusMinutes(RESET_TOKEN_VALID_MINUTES)
            );
            passwordResetTokenRepository.save(resetToken);

            String resetLink = frontendUrl + "/esqueceu-senha?token=" + rawToken;
            emailService.sendPasswordRecoveryEmail(user.getEmail(), resetLink);
        });
    }

    @Transactional
    public void completePasswordRecovery(String rawToken, String newPassword) {
        validateNewPassword(newPassword);

        if (rawToken == null || rawToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido ou expirado");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(hashToken(rawToken))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido ou expirado"));

        if (resetToken.getUsedAt() != null || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido ou expirado");
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido ou expirado"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);
    }

    // RF-AUT-006: exige a senha atual pra confirmar que é o dono da conta.
    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        validateNewPassword(newPassword);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        if (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha atual incorreta");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private void validateNewPassword(String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A nova senha deve ter pelo menos 6 caracteres");
        }
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 não disponível", e);
        }
    }

    // Conecta a conta de login de um CLIENT ao registro de Customer que o
    // staff já cadastrou com o mesmo e-mail (ex.: Admin > Clientes) — sem
    // isso, User (login) e Customer (CRM) nunca se encontram e o cliente
    // fica sem tenant, incapaz de ver ou reservar qualquer coisa própria.
    private User linkCustomerIfNeeded(User user) {
        if (user.getRole() != Role.CLIENT || user.getTenantId() != null) {
            return user;
        }

        return customerRepository.findFirstByEmailIgnoreCaseAndUserIdIsNull(user.getEmail())
                .map(customer -> {
                    customer.setUserId(user.getId());
                    customerRepository.save(customer);

                    user.assignTenantId(customer.getTenantId());
                    return userRepository.save(user);
                })
                .orElse(user);
    }
}
