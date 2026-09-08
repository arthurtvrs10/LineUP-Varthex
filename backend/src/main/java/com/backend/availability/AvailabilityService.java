package com.backend.availability;

import com.backend.availability.dto.AvailabilityExceptionRequest;
import com.backend.availability.dto.AvailabilityExceptionResponse;
import com.backend.availability.dto.AvailabilitySlotResponse;
import com.backend.availability.dto.WorkScheduleItemRequest;
import com.backend.availability.dto.WorkScheduleResponse;
import com.backend.barbers.BarberProfile;
import com.backend.barbers.BarberRepository;
import com.backend.scheduling.Appointment;
import com.backend.scheduling.AppointmentRepository;
import com.backend.scheduling.AppointmentStatus;
import com.backend.services.ServiceOffering;
import com.backend.services.ServiceOfferingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class AvailabilityService {

    private static final int SLOT_GRANULARITY_MINUTES = 15;

    private final WorkScheduleRepository workScheduleRepository;
    private final AvailabilityExceptionRepository availabilityExceptionRepository;
    private final BarberRepository barberRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final AppointmentRepository appointmentRepository;

    public AvailabilityService(WorkScheduleRepository workScheduleRepository,
                                AvailabilityExceptionRepository availabilityExceptionRepository,
                                BarberRepository barberRepository,
                                ServiceOfferingRepository serviceOfferingRepository,
                                AppointmentRepository appointmentRepository) {
        this.workScheduleRepository = workScheduleRepository;
        this.availabilityExceptionRepository = availabilityExceptionRepository;
        this.barberRepository = barberRepository;
        this.serviceOfferingRepository = serviceOfferingRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // RF-DIS-001: jornada semanal. PUT substitui a semana inteira (mais simples
    // e honesto do que um CRUD incremental item a item).
    @Transactional
    public List<WorkScheduleResponse> replaceWorkSchedule(UUID tenantId, UUID barberId, List<WorkScheduleItemRequest> items) {
        BarberProfile barber = requireBarberInTenant(tenantId, barberId);

        validateNoOverlap(items);

        workScheduleRepository.deleteAllByBarberId(barber.getId());

        List<WorkSchedule> saved = items.stream()
                .map(item -> workScheduleRepository.save(
                        new WorkSchedule(tenantId, barberId, item.weekday(), item.startTime(), item.endTime())))
                .toList();

        return saved.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<WorkScheduleResponse> listWorkSchedule(UUID tenantId, UUID barberId) {
        requireBarberInTenant(tenantId, barberId);
        return workScheduleRepository.findAllByBarberId(barberId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AvailabilityExceptionResponse createException(UUID tenantId, UUID barberId, AvailabilityExceptionRequest request) {
        requireBarberInTenant(tenantId, barberId);

        if (request.type() == null || request.startsAt() == null || request.endsAt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados obrigatórios faltando");
        }
        if (!request.endsAt().isAfter(request.startsAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O fim precisa ser depois do início");
        }

        AvailabilityException exception = new AvailabilityException(
                tenantId, barberId, request.type(), request.startsAt(), request.endsAt(), request.reason()
        );

        return toResponse(availabilityExceptionRepository.save(exception));
    }

    @Transactional(readOnly = true)
    public List<AvailabilityExceptionResponse> listExceptions(UUID tenantId, UUID barberId) {
        requireBarberInTenant(tenantId, barberId);
        return availabilityExceptionRepository.findAllByBarberId(barberId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void deleteException(UUID tenantId, UUID barberId, UUID exceptionId) {
        requireBarberInTenant(tenantId, barberId);

        AvailabilityException exception = availabilityExceptionRepository.findById(exceptionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exceção não encontrada"));

        if (!exception.getTenantId().equals(tenantId) || !exception.getBarberId().equals(barberId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Exceção não encontrada");
        }

        availabilityExceptionRepository.delete(exception);
    }

    // RF-DIS-005/006: slots livres = jornada do dia - exceções - agendamentos
    // existentes, considerando a duração (+ buffers) do serviço pedido.
    @Transactional(readOnly = true)
    public List<AvailabilitySlotResponse> computeAvailability(UUID tenantId, UUID barberId, LocalDate date, UUID serviceId) {
        requireBarberInTenant(tenantId, barberId);

        ServiceOffering service = serviceOfferingRepository.findById(serviceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Serviço não encontrado"));
        if (!service.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Serviço não encontrado");
        }

        int durationMinutes = service.getDurationMinutes() + service.getBufferBeforeMinutes() + service.getBufferAfterMinutes();

        // 0 = segunda ... 6 = domingo (DayOfWeek.getValue() é 1 = segunda ... 7 = domingo).
        int weekday = date.getDayOfWeek().getValue() - 1;
        List<WorkSchedule> ranges = workScheduleRepository.findAllByBarberIdAndWeekday(barberId, weekday);

        if (ranges.isEmpty()) {
            return List.of();
        }

        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = dayStart.plusDays(1);

        List<AvailabilityException> exceptions = availabilityExceptionRepository.findAllOverlapping(barberId, dayStart, dayEnd);
        List<Appointment> appointments = appointmentRepository
                .findAllByTenantIdAndBarberIdAndStartAtLessThanAndEndAtGreaterThan(tenantId, barberId, dayEnd, dayStart)
                .stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELED && a.getStatus() != AppointmentStatus.NO_SHOW)
                .toList();

        List<AvailabilitySlotResponse> slots = new ArrayList<>();

        for (WorkSchedule range : ranges) {
            LocalDateTime rangeStart = LocalDateTime.of(date, range.getStartTime());
            LocalDateTime rangeEnd = LocalDateTime.of(date, range.getEndTime());

            LocalDateTime cursor = rangeStart;
            while (!cursor.plusMinutes(durationMinutes).isAfter(rangeEnd)) {
                final LocalDateTime candidate = cursor;
                final LocalDateTime candidateEnd = cursor.plusMinutes(durationMinutes);

                boolean blocked = exceptions.stream().anyMatch(e -> candidate.isBefore(e.getEndsAt()) && candidateEnd.isAfter(e.getStartsAt()))
                        || appointments.stream().anyMatch(a -> candidate.isBefore(a.getEndAt()) && candidateEnd.isAfter(a.getStartAt()));

                if (!blocked) {
                    slots.add(new AvailabilitySlotResponse(candidate, candidateEnd));
                }

                cursor = cursor.plusMinutes(SLOT_GRANULARITY_MINUTES);
            }
        }

        return slots;
    }

    private void validateNoOverlap(List<WorkScheduleItemRequest> items) {
        for (WorkScheduleItemRequest item : items) {
            if (item.startTime() == null || item.endTime() == null || !item.endTime().isAfter(item.startTime())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faixa de horário inválida");
            }
        }

        List<WorkScheduleItemRequest> sorted = items.stream()
                .sorted(Comparator.comparing(WorkScheduleItemRequest::weekday).thenComparing(WorkScheduleItemRequest::startTime))
                .toList();

        for (int i = 1; i < sorted.size(); i++) {
            WorkScheduleItemRequest prev = sorted.get(i - 1);
            WorkScheduleItemRequest curr = sorted.get(i);
            if (prev.weekday() == curr.weekday() && curr.startTime().isBefore(prev.endTime())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faixas de horário não podem se sobrepor no mesmo dia");
            }
        }
    }

    private BarberProfile requireBarberInTenant(UUID tenantId, UUID barberId) {
        BarberProfile barber = barberRepository.findById(barberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Barbeiro não encontrado"));

        if (!barber.getUnit().getTenant().getId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Barbeiro não encontrado");
        }

        return barber;
    }

    private WorkScheduleResponse toResponse(WorkSchedule schedule) {
        return new WorkScheduleResponse(schedule.getId(), schedule.getWeekday(), schedule.getStartTime(), schedule.getEndTime());
    }

    private AvailabilityExceptionResponse toResponse(AvailabilityException exception) {
        return new AvailabilityExceptionResponse(
                exception.getId(), exception.getType(), exception.getStartsAt(), exception.getEndsAt(), exception.getReason()
        );
    }
}
