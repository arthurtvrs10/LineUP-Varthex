package com.backend.barbers.auth;

import com.backend.barbers.auth.dto.ChangePasswordRequest;
import com.backend.barbers.auth.dto.LoginRequest;
import com.backend.barbers.auth.dto.LoginResponse;
import com.backend.barbers.auth.dto.MeResponse;
import com.backend.barbers.auth.dto.PasswordRecoveryCompleteRequest;
import com.backend.barbers.auth.dto.PasswordRecoveryRequest;
import com.backend.barbers.auth.dto.RefreshTokenRequest;
import com.backend.barbers.auth.dto.SessionResponse;
import com.backend.barbers.auth.dto.SocialLoginRequest;
import com.backend.users.Role;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request,
                                @RequestHeader(value = "User-Agent", required = false) String userAgent){
        return authService.login(request, userAgent);
    }

    @PostMapping("/social-login")
    public LoginResponse socialLogin(@RequestBody SocialLoginRequest request,
                                      @RequestHeader(value = "User-Agent", required = false) String userAgent){
        return authService.processSocialLogin(request.idToken(), userAgent);
    }

    @PostMapping("/refresh")
    public LoginResponse refresh(@RequestBody RefreshTokenRequest request,
                                  @RequestHeader(value = "User-Agent", required = false) String userAgent) {
        return authService.refresh(request.refreshToken(), userAgent);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestBody(required = false) RefreshTokenRequest request) {
        authService.logout(request != null ? request.refreshToken() : null);
    }

    @PostMapping("/logout-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logoutAll(JwtAuthenticationToken authentication) {
        authService.logoutAll(UUID.fromString(authentication.getToken().getSubject()));
    }

    @GetMapping("/sessions")
    public List<SessionResponse> sessions(JwtAuthenticationToken authentication) {
        return authService.listSessions(UUID.fromString(authentication.getToken().getSubject()));
    }

    @DeleteMapping("/sessions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokeSession(@PathVariable UUID id, JwtAuthenticationToken authentication) {
        authService.revokeSession(UUID.fromString(authentication.getToken().getSubject()), id);
    }

    @PostMapping("/password-recovery")
    @ResponseStatus(HttpStatus.OK)
    public void requestPasswordRecovery(@RequestBody PasswordRecoveryRequest request) {
        authService.requestPasswordRecovery(request.email());
    }

    @PostMapping("/password-recovery/complete")
    @ResponseStatus(HttpStatus.OK)
    public void completePasswordRecovery(@RequestBody PasswordRecoveryCompleteRequest request) {
        authService.completePasswordRecovery(request.token(), request.newPassword());
    }

    @PatchMapping("/password")
    @ResponseStatus(HttpStatus.OK)
    public void changePassword(@RequestBody ChangePasswordRequest request, JwtAuthenticationToken authentication) {
        UUID userId = UUID.fromString(authentication.getToken().getSubject());
        authService.changePassword(userId, request.currentPassword(), request.newPassword());
    }

    @GetMapping("/me")
    public MeResponse me(JwtAuthenticationToken authentication){
        Jwt jwt = authentication.getToken();

        String tenantIdClaim =
                jwt.getClaimAsString("tenantId");

        UUID tenantId = tenantIdClaim != null
                ? UUID.fromString(tenantIdClaim)
                : null;

        return new MeResponse(
                UUID.fromString(jwt.getSubject()),
                jwt.getClaimAsString("email"),
                jwt.getClaimAsString("name"),
                Role.valueOf(jwt.getClaimAsString("role")),
                tenantId
        );
    }
}

