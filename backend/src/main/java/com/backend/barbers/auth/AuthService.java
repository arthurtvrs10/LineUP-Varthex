package com.backend.barbers.auth;

import com.backend.auth.jwt.JwtService;
import com.backend.barbers.auth.dto.LoginRequest;
import com.backend.barbers.auth.dto.LoginResponse;
import com.backend.barbers.auth.dto.SessionResponse;
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
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private static final int RESET_TOKEN_VALID_MINUTES = 30;

    // RF-AUT-007: bloqueio simples após tentativas seguidas erradas — sem
    // lib nova, só os dois campos novos em User.
    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    // RF-AUT-008: cada refresh token é uma sessão/dispositivo.
    private static final int REFRESH_TOKEN_VALID_DAYS = 30;

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleIdTokenDecoder googleIdTokenDecoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
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
                       RefreshTokenRepository refreshTokenRepository,
                       EmailService emailService,
                       @Value("${app.frontend-url:http://localhost:3000}") String frontendUrl) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.googleIdTokenDecoder = googleIdTokenDecoder;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public LoginResponse login(LoginRequest request, String userAgent){
        User existing = userRepository.findByEmail(request.email()).orElse(null);

        if (existing != null && existing.getLockedUntil() != null && existing.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Conta temporariamente bloqueada após várias tentativas. Tente novamente mais tarde.");
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email(),
                            request.password()
                    )
            );
        } catch (BadCredentialsException e) {
            if (existing != null) {
                registerFailedLoginAttempt(existing);
            }
            throw e;
        }

        AuthUserDetails authUserDetails = (AuthUserDetails) authentication.getPrincipal();

        User user = linkCustomerIfNeeded(authUserDetails.getUser());
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        String accessToken = jwtService.generateTokemn(user);
        String refreshToken = issueRefreshToken(user.getId(), userAgent);

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                accessToken,
                refreshToken,
                "Bearer",
                "Login realizado com sucesso"
        );

    }

    @Transactional
    public LoginResponse processSocialLogin(String idToken, String userAgent) {
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
        String refreshToken = issueRefreshToken(user.getId(), userAgent);

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                accessToken,
                refreshToken,
                "Bearer",
                "Login com Google realizado com sucesso"
        );
    }

    // RF-AUT-002: token usado é revogado e substituído (rotação) — se o
    // hash recebido não bate com nenhum ativo, alguém já usou esse refresh
    // token antes (roubo/replay) ou ele expirou; a única resposta segura é
    // rejeitar, nunca tentar adivinhar qual sessão era.
    @Transactional
    public LoginResponse refresh(String rawRefreshToken, String userAgent) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão expirada, faça login novamente");
        }

        RefreshToken token = refreshTokenRepository.findByTokenHash(hashToken(rawRefreshToken))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão expirada, faça login novamente"));

        if (!token.isActive()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão expirada, faça login novamente");
        }

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão expirada, faça login novamente"));

        token.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(token);

        String accessToken = jwtService.generateTokemn(user);
        String newRefreshToken = issueRefreshToken(user.getId(), userAgent);

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                accessToken,
                newRefreshToken,
                "Bearer",
                "Sessão renovada"
        );
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }

        refreshTokenRepository.findByTokenHash(hashToken(rawRefreshToken)).ifPresent(token -> {
            token.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void logoutAll(UUID userId) {
        List<RefreshToken> active = refreshTokenRepository.findAllByUserIdAndRevokedAtIsNullOrderByCreatedAtDesc(userId);
        LocalDateTime now = LocalDateTime.now();
        active.forEach(token -> token.setRevokedAt(now));
        refreshTokenRepository.saveAll(active);
    }

    public List<SessionResponse> listSessions(UUID userId) {
        return refreshTokenRepository.findAllByUserIdAndRevokedAtIsNullOrderByCreatedAtDesc(userId).stream()
                .filter(RefreshToken::isActive)
                .map(t -> new SessionResponse(t.getId(), t.getCreatedAt(), t.getExpiresAt(), t.getUserAgent()))
                .toList();
    }

    @Transactional
    public void revokeSession(UUID userId, UUID sessionId) {
        RefreshToken token = refreshTokenRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sessão não encontrada"));

        if (!token.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Sessão não encontrada");
        }

        token.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(token);
    }

    private String issueRefreshToken(UUID userId, String userAgent) {
        String rawToken = generateRawToken();
        RefreshToken token = new RefreshToken(
                userId, hashToken(rawToken), LocalDateTime.now().plusDays(REFRESH_TOKEN_VALID_DAYS), userAgent
        );
        refreshTokenRepository.save(token);
        return rawToken;
    }

    private void registerFailedLoginAttempt(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
        }
        userRepository.save(user);
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
