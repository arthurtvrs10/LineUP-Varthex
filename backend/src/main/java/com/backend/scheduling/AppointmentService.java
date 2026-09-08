package com.backend.scheduling;

import com.backend.barbers.BarberProfile;
import com.backend.barbers.BarberRepository;
import com.backend.commissions.CommissionService;
import com.backend.customers.Customer;
import com.backend.customers.CustomerRepository;
import com.backend.notifications.NotificationService;
import com.backend.notifications.NotificationType;
import com.backend.scheduling.dto.AppointmentActionRequest;
import com.backend.scheduling.dto.AppointmentCreateRequest;
import com.backend.scheduling.dto.AppointmentItemResponse;
import com.backend.scheduling.dto.AppointmentResponse;
import com.backend.services.ServiceOffering;
import com.backend.services.ServiceOfferingRepository;
import com.backend.units.Unit;
import com.backend.units.UnitRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class AppointmentService {

    // Transições válidas da máquina de estados do agendamento.
    private static final java.util.Map<AppointmentStatus, Set<AppointmentStatus>> TRANSITIONS = java.util.Map.of(
            AppointmentStatus.PENDING, Set.of(AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELED),
            AppointmentStatus.CONFIRMED, Set.of(AppointmentStatus.CHECKED_IN, AppointmentStatus.CANCELED, AppointmentStatus.NO_SHOW),
            AppointmentStatus.CHECKED_IN, Set.of(AppointmentStatus.IN_PROGRESS, AppointmentStatus.CANCELED, AppointmentStatus.NO_SHOW),
            AppointmentStatus.IN_PROGRESS, Set.of(AppointmentStatus.COMPLETED)
    );

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final BarberRepository barberRepository;
    private final UnitRepository unitRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final CommissionService commissionService;
    private final NotificationService notificationService;

    private static final DateTimeFormatter WHEN_FORMAT = DateTimeFormatter.ofPattern("dd/MM 'às' HH:mm");

    public AppointmentService(AppointmentRepository appointmentRepository,
                               CustomerRepository customerRepository,
                               BarberRepository barberRepository,
                               UnitRepository unitRepository,
                               ServiceOfferingRepository serviceOfferingRepository,
                               CommissionService commissionService,
                               NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.customerRepository = customerRepository;
        this.barberRepository = barberRepository;
        this.unitRepository = unitRepository;
        this.serviceOfferingRepository = serviceOfferingRepository;
        this.commissionService = commissionService;
        this.notificationService = notificationService;
    }

    @Transactional
    public AppointmentResponse createAppointment(UUID tenantId, AppointmentCreateRequest request, UUID restrictCustomerId) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe ao menos um serviço");
        }

        // Cliente autenticado nunca escolhe por quem está reservando —
        // mesmo que envie outro customerId no corpo, ele é ignorado aqui,
        // igual ao padrão já usado para tenantId em outros serviços.
        UUID customerId = restrictCustomerId != null ? restrictCustomerId : request.customerId();

        if (request.startAt() == null || request.unitId() == null
                || customerId == null || request.barberId() == null || request.channel() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados obrigatórios faltando");
        }

        Unit unit = unitRepository.findById(request.unitId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unidade não encontrada"));
        requireSameTenant(unit.getTenant().getId(), tenantId, "Unidade não encontrada");

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente não encontrado"));
        requireSameTenant(customer.getTenantId(), tenantId, "Cliente não encontrado");

        BarberProfile barber = barberRepository.findById(request.barberId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Barbeiro não encontrado"));
        requireSameTenant(barber.getUnit().getTenant().getId(), tenantId, "Barbeiro não encontrado");

        Appointment appointment = new Appointment(
                tenantId, request.unitId(), customerId, request.barberId(),
                request.channel(), request.startAt(), request.startAt(), request.notes()
        );

        int totalMinutes = 0;
        for (var itemInput : request.items()) {
            ServiceOffering service = serviceOfferingRepository.findById(itemInput.serviceId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Serviço não encontrado"));
            requireSameTenant(service.getTenantId(), tenantId, "Serviço não encontrado");

            totalMinutes += service.getDurationMinutes() + service.getBufferBeforeMinutes() + service.getBufferAfterMinutes();

            appointment.addItem(new AppointmentItem(
                    service.getId(), service.getName(), service.getDurationMinutes(), service.getPrice()
            ));
        }

        LocalDateTime endAt = request.startAt().plusMinutes(totalMinutes);
        appointment.setEndAt(endAt);

        if (appointmentRepository.hasConflict(request.barberId(), request.startAt(), endAt, null)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Horário indisponível para este profissional");
        }

        Appointment saved = appointmentRepository.save(appointment);

        notificationService.notifyUser(
                tenantId, barber.getUser().getId(), NotificationType.APPOINTMENT_CREATED,
                "Novo agendamento com você",
                customer.getFullName() + " marcou horário para " + saved.getStartAt().format(WHEN_FORMAT) + ".",
                "APPOINTMENT", saved.getId()
        );

        return toResponse(saved);
    }

    public List<AppointmentResponse> listAppointments(UUID tenantId, LocalDateTime from, LocalDateTime to,
                                                        UUID barberId, AppointmentStatus status, UUID restrictCustomerId) {
        List<Appointment> appointments = barberId != null
                ? appointmentRepository.findAllByTenantIdAndBarberIdAndStartAtLessThanAndEndAtGreaterThan(tenantId, barberId, to, from)
                : appointmentRepository.findAllByTenantIdAndStartAtLessThanAndEndAtGreaterThan(tenantId, to, from);

        return appointments.stream()
                .filter(a -> status == null || a.getStatus() == status)
                .filter(a -> restrictCustomerId == null || restrictCustomerId.equals(a.getCustomerId()))
                .map(this::toResponse)
                .toList();
    }

    public AppointmentResponse getAppointment(UUID tenantId, UUID appointmentId, UUID restrictCustomerId) {
        return toResponse(findByIdAndTenant(tenantId, appointmentId, restrictCustomerId));
    }

    @Transactional
    public AppointmentResponse transitionAppointment(UUID tenantId, UUID appointmentId, String action,
                                                       AppointmentActionRequest request, UUID restrictCustomerId) {
        if (restrictCustomerId != null && !"cancel".equals(action)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ação não permitida para clientes");
        }

        Appointment appointment = findByIdAndTenant(tenantId, appointmentId, restrictCustomerId);

        if (request != null && request.version() != null && !appointment.getVersion().equals(request.version())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O agendamento foi modificado por outra requisição");
        }

        AppointmentStatus target = resolveTarget(action);
        Set<AppointmentStatus> allowed = TRANSITIONS.getOrDefault(appointment.getStatus(), Set.of());

        if (!allowed.contains(target)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Não é possível ir de " + appointment.getStatus() + " para " + target
            );
        }

        appointment.setStatus(target);

        if (target == AppointmentStatus.CANCELED) {
            appointment.setCanceledAt(LocalDateTime.now());
            appointment.setCancellationReason(request != null ? request.reason() : null);
        }
        if (target == AppointmentStatus.COMPLETED) {
            appointment.setCompletedAt(LocalDateTime.now());
        }

        Appointment saved = appointmentRepository.save(appointment);

        if (target == AppointmentStatus.COMPLETED) {
            // Provisiona a comissão de cada item já com o agendamento salvo
            // (mesma transação) — RN-COM-002/003/005: comissão nasce na conclusão.
            commissionService.provisionForAppointment(saved);
        }

        if (target == AppointmentStatus.CONFIRMED) {
            notifyCustomerAppointmentConfirmed(tenantId, saved);
        }
        if (target == AppointmentStatus.CANCELED) {
            notifyAppointmentCanceled(tenantId, saved);
        }

        return toResponse(saved);
    }

    private void notifyCustomerAppointmentConfirmed(UUID tenantId, Appointment appointment) {
        Customer customer = customerRepository.findById(appointment.getCustomerId()).orElse(null);
        if (customer == null) {
            return;
        }

        String when = appointment.getStartAt().format(WHEN_FORMAT);
        String message = "Seu agendamento em " + when + " foi confirmado.";
        String html = "<p>" + message + "</p>";

        notificationService.notifyCustomer(
                tenantId, customer, NotificationType.APPOINTMENT_CONFIRMED,
                "Agendamento confirmado", message,
                "Agendamento confirmado — LINEUP", html,
                "APPOINTMENT", appointment.getId()
        );
    }

    private void notifyAppointmentCanceled(UUID tenantId, Appointment appointment) {
        Customer customer = customerRepository.findById(appointment.getCustomerId()).orElse(null);
        String when = appointment.getStartAt().format(WHEN_FORMAT);

        if (customer != null) {
            String message = "Seu agendamento em " + when + " foi cancelado.";
            String html = "<p>" + message + "</p>";

            notificationService.notifyCustomer(
                    tenantId, customer, NotificationType.APPOINTMENT_CANCELED,
                    "Agendamento cancelado", message,
                    "Agendamento cancelado — LINEUP", html,
                    "APPOINTMENT", appointment.getId()
            );
        }

        barberRepository.findById(appointment.getBarberId()).ifPresent(barber ->
                notificationService.notifyUser(
                        tenantId, barber.getUser().getId(), NotificationType.APPOINTMENT_CANCELED,
                        "Horário liberado",
                        "Uma vaga foi liberada em " + when + ".",
                        "APPOINTMENT", appointment.getId()
                ));
    }

    private AppointmentStatus resolveTarget(String action) {
        return switch (action) {
            case "confirm" -> AppointmentStatus.CONFIRMED;
            case "check-in" -> AppointmentStatus.CHECKED_IN;
            case "start" -> AppointmentStatus.IN_PROGRESS;
            case "complete" -> AppointmentStatus.COMPLETED;
            case "cancel" -> AppointmentStatus.CANCELED;
            case "no-show" -> AppointmentStatus.NO_SHOW;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ação inválida: " + action);
        };
    }

    private Appointment findByIdAndTenant(UUID tenantId, UUID appointmentId, UUID restrictCustomerId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento não encontrado"));

        if (!appointment.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento não encontrado");
        }

        if (restrictCustomerId != null && !restrictCustomerId.equals(appointment.getCustomerId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento não encontrado");
        }

        return appointment;
    }

    private void requireSameTenant(UUID actualTenantId, UUID expectedTenantId, String message) {
        if (!expectedTenantId.equals(actualTenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        List<AppointmentItemResponse> items = appointment.getItems().stream()
                .map(item -> new AppointmentItemResponse(
                        item.getId(),
                        item.getServiceId(),
                        item.getName(),
                        item.getDurationMinutes(),
                        item.getUnitPrice().toPlainString(),
                        item.getDiscountAmount().toPlainString()
                ))
                .toList();

        return new AppointmentResponse(
                appointment.getId(),
                appointment.getUnitId(),
                appointment.getCustomerId(),
                appointment.getBarberId(),
                appointment.getStatus(),
                appointment.getChannel(),
                appointment.getStartAt(),
                appointment.getEndAt(),
                appointment.getTotalAmount().toPlainString(),
                appointment.getDiscountAmount().toPlainString(),
                appointment.getSurchargeAmount().toPlainString(),
                appointment.getTipAmount().toPlainString(),
                appointment.getNotes(),
                items,
                appointment.getCancellationReason(),
                appointment.getCanceledAt(),
                appointment.getCompletedAt(),
                appointment.getVersion()
        );
    }
}
