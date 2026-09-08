package com.backend.scheduling;

import com.backend.scheduling.dto.AppointmentActionRequest;
import com.backend.scheduling.dto.AppointmentCreateRequest;
import com.backend.scheduling.dto.AppointmentResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse createAppointment(
            @RequestBody AppointmentCreateRequest request,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.createAppointment(currentTenantId(authentication), request);
    }

    @GetMapping
    public List<AppointmentResponse> getAppointments(
            @RequestParam LocalDateTime from,
            @RequestParam LocalDateTime to,
            @RequestParam(required = false) UUID barberId,
            @RequestParam(required = false) AppointmentStatus status,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.listAppointments(currentTenantId(authentication), from, to, barberId, status);
    }

    @GetMapping("/{appointmentId}")
    public AppointmentResponse getAppointment(
            @PathVariable UUID appointmentId,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.getAppointment(currentTenantId(authentication), appointmentId);
    }

    @PostMapping("/{appointmentId}/confirm")
    public AppointmentResponse confirm(
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentActionRequest request,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.transitionAppointment(currentTenantId(authentication), appointmentId, "confirm", request);
    }

    @PostMapping("/{appointmentId}/check-in")
    public AppointmentResponse checkIn(
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentActionRequest request,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.transitionAppointment(currentTenantId(authentication), appointmentId, "check-in", request);
    }

    @PostMapping("/{appointmentId}/start")
    public AppointmentResponse start(
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentActionRequest request,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.transitionAppointment(currentTenantId(authentication), appointmentId, "start", request);
    }

    @PostMapping("/{appointmentId}/complete")
    public AppointmentResponse complete(
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentActionRequest request,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.transitionAppointment(currentTenantId(authentication), appointmentId, "complete", request);
    }

    @PostMapping("/{appointmentId}/cancel")
    public AppointmentResponse cancel(
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentActionRequest request,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.transitionAppointment(currentTenantId(authentication), appointmentId, "cancel", request);
    }

    @PostMapping("/{appointmentId}/no-show")
    public AppointmentResponse noShow(
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentActionRequest request,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.transitionAppointment(currentTenantId(authentication), appointmentId, "no-show", request);
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
}
