package com.backend.availability;

import com.backend.availability.dto.AvailabilityExceptionRequest;
import com.backend.availability.dto.AvailabilityExceptionResponse;
import com.backend.availability.dto.AvailabilitySlotResponse;
import com.backend.availability.dto.WorkScheduleItemRequest;
import com.backend.availability.dto.WorkScheduleResponse;
import com.backend.barbers.BarberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/barbers/{barberId}")
public class AvailabilityController {

    private final AvailabilityService availabilityService;
    private final BarberRepository barberRepository;

    public AvailabilityController(AvailabilityService availabilityService, BarberRepository barberRepository) {
        this.availabilityService = availabilityService;
        this.barberRepository = barberRepository;
    }

    @GetMapping("/availability")
    public List<AvailabilitySlotResponse> availability(
            @PathVariable UUID barberId,
            @RequestParam LocalDate date,
            @RequestParam UUID serviceId,
            JwtAuthenticationToken authentication
    ) {
        return availabilityService.computeAvailability(currentTenantId(authentication), barberId, date, serviceId);
    }

    @GetMapping("/work-schedules")
    public List<WorkScheduleResponse> listWorkSchedule(@PathVariable UUID barberId, JwtAuthenticationToken authentication) {
        return availabilityService.listWorkSchedule(currentTenantId(authentication), barberId);
    }

    @PutMapping("/work-schedules")
    public List<WorkScheduleResponse> replaceWorkSchedule(
            @PathVariable UUID barberId,
            @RequestBody List<WorkScheduleItemRequest> items,
            JwtAuthenticationToken authentication
    ) {
        requireSelfOrStaff(authentication, barberId);
        return availabilityService.replaceWorkSchedule(currentTenantId(authentication), barberId, items);
    }

    @GetMapping("/availability-exceptions")
    public List<AvailabilityExceptionResponse> listExceptions(@PathVariable UUID barberId, JwtAuthenticationToken authentication) {
        return availabilityService.listExceptions(currentTenantId(authentication), barberId);
    }

    @PostMapping("/availability-exceptions")
    @ResponseStatus(HttpStatus.CREATED)
    public AvailabilityExceptionResponse createException(
            @PathVariable UUID barberId,
            @RequestBody AvailabilityExceptionRequest request,
            JwtAuthenticationToken authentication
    ) {
        requireSelfOrStaff(authentication, barberId);
        return availabilityService.createException(currentTenantId(authentication), barberId, request);
    }

    @DeleteMapping("/availability-exceptions/{exceptionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteException(
            @PathVariable UUID barberId,
            @PathVariable UUID exceptionId,
            JwtAuthenticationToken authentication
    ) {
        requireSelfOrStaff(authentication, barberId);
        availabilityService.deleteException(currentTenantId(authentication), barberId, exceptionId);
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

    // BARBER só edita a própria jornada/exceções; ADMIN/SUPER_ADMIN edita
    // qualquer uma do tenant (checagem de tenant já ocorre no service).
    private void requireSelfOrStaff(JwtAuthenticationToken authentication, UUID barberId) {
        String role = authentication.getToken().getClaimAsString("role");
        if (!"BARBER".equals(role)) {
            return;
        }

        UUID userId = UUID.fromString(authentication.getToken().getSubject());
        UUID ownBarberId = barberRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Este usuário não tem um perfil de barbeiro"))
                .getId();

        if (!ownBarberId.equals(barberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Só é possível editar a própria disponibilidade");
        }
    }
}
