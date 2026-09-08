package com.backend.scheduling;

import com.backend.customers.CustomerRepository;
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
    private final CustomerRepository customerRepository;

    public AppointmentController(AppointmentService appointmentService, CustomerRepository customerRepository) {
        this.appointmentService = appointmentService;
        this.customerRepository = customerRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse createAppointment(
            @RequestBody AppointmentCreateRequest request,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.createAppointment(
                currentTenantId(authentication), request, restrictToOwnCustomer(authentication)
        );
    }

    @GetMapping
    public List<AppointmentResponse> getAppointments(
            @RequestParam LocalDateTime from,
            @RequestParam LocalDateTime to,
            @RequestParam(required = false) UUID barberId,
            @RequestParam(required = false) AppointmentStatus status,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.listAppointments(
                currentTenantId(authentication), from, to, barberId, status, restrictToOwnCustomer(authentication)
        );
    }

    @GetMapping("/{appointmentId}")
    public AppointmentResponse getAppointment(
            @PathVariable UUID appointmentId,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.getAppointment(
                currentTenantId(authentication), appointmentId, restrictToOwnCustomer(authentication)
        );
    }

    @PostMapping("/{appointmentId}/confirm")
    public AppointmentResponse confirm(
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentActionRequest request,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.transitionAppointment(currentTenantId(authentication), appointmentId, "confirm", request, null);
    }

    @PostMapping("/{appointmentId}/check-in")
    public AppointmentResponse checkIn(
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentActionRequest request,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.transitionAppointment(currentTenantId(authentication), appointmentId, "check-in", request, null);
    }

    @PostMapping("/{appointmentId}/start")
    public AppointmentResponse start(
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentActionRequest request,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.transitionAppointment(currentTenantId(authentication), appointmentId, "start", request, null);
    }

    @PostMapping("/{appointmentId}/complete")
    public AppointmentResponse complete(
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentActionRequest request,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.transitionAppointment(currentTenantId(authentication), appointmentId, "complete", request, null);
    }

    @PostMapping("/{appointmentId}/cancel")
    public AppointmentResponse cancel(
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentActionRequest request,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.transitionAppointment(
                currentTenantId(authentication), appointmentId, "cancel", request, restrictToOwnCustomer(authentication)
        );
    }

    @PostMapping("/{appointmentId}/no-show")
    public AppointmentResponse noShow(
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentActionRequest request,
            JwtAuthenticationToken authentication
    ) {
        return appointmentService.transitionAppointment(currentTenantId(authentication), appointmentId, "no-show", request, null);
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

    // Para CLIENT, toda operação de agendamento é restrita ao próprio
    // Customer vinculado — nunca ao que o corpo/query da requisição diz.
    // Para as demais roles (staff), retorna null, ou seja, sem restrição.
    private UUID restrictToOwnCustomer(JwtAuthenticationToken authentication) {
        String role = authentication.getToken().getClaimAsString("role");

        if (!"CLIENT".equals(role)) {
            return null;
        }

        UUID userId = UUID.fromString(authentication.getToken().getSubject());

        return customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Você ainda não é cliente de nenhuma barbearia"
                ))
                .getId();
    }
}
