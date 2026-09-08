package com.backend.notifications;

import com.backend.notifications.dto.NotificationResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

// Todo mundo (staff ou cliente) só vê e mexe nas próprias notificações — o
// escopo é sempre o recipientUserId do próprio JWT, nunca um parâmetro.
@RestController
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/notifications")
    public List<NotificationResponse> list(JwtAuthenticationToken authentication) {
        return notificationService.list(currentTenantId(authentication), currentUserId(authentication));
    }

    @PatchMapping("/notifications/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@PathVariable UUID id, JwtAuthenticationToken authentication) {
        notificationService.markRead(currentTenantId(authentication), currentUserId(authentication), id);
    }

    @PatchMapping("/notifications/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(JwtAuthenticationToken authentication) {
        notificationService.markAllRead(currentTenantId(authentication), currentUserId(authentication));
    }

    private UUID currentTenantId(JwtAuthenticationToken authentication) {
        String claim = authentication.getToken().getClaimAsString("tenantId");

        if (claim == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Usuário autenticado não está vinculado a nenhuma barbearia"
            );
        }

        return UUID.fromString(claim);
    }

    private UUID currentUserId(JwtAuthenticationToken authentication) {
        return UUID.fromString(authentication.getToken().getSubject());
    }
}
