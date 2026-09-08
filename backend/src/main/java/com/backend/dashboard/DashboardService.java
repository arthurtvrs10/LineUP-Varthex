package com.backend.dashboard;

import com.backend.commissions.CommissionEntry;
import com.backend.commissions.CommissionEntryRepository;
import com.backend.dashboard.dto.DashboardOverviewResponse;
import com.backend.scheduling.Appointment;
import com.backend.scheduling.AppointmentRepository;
import com.backend.scheduling.AppointmentStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DashboardService {

    private final AppointmentRepository appointmentRepository;
    private final CommissionEntryRepository commissionEntryRepository;

    public DashboardService(AppointmentRepository appointmentRepository,
                             CommissionEntryRepository commissionEntryRepository) {
        this.appointmentRepository = appointmentRepository;
        this.commissionEntryRepository = commissionEntryRepository;
    }

    // RF-REL-001/003: resumo do dia, com filtro opcional por profissional.
    public DashboardOverviewResponse overview(UUID tenantId, LocalDate date, UUID barberId) {
        LocalDateTime from = date.atStartOfDay();
        LocalDateTime to = date.plusDays(1).atStartOfDay();

        List<Appointment> appointments = barberId != null
                ? appointmentRepository.findAllByTenantIdAndBarberIdAndStartAtLessThanAndEndAtGreaterThan(tenantId, barberId, to, from)
                : appointmentRepository.findAllByTenantIdAndStartAtLessThanAndEndAtGreaterThan(tenantId, to, from);

        int scheduled = appointments.size();
        int completed = countByStatus(appointments, AppointmentStatus.COMPLETED);
        int canceled = countByStatus(appointments, AppointmentStatus.CANCELED);
        int noShow = countByStatus(appointments, AppointmentStatus.NO_SHOW);

        BigDecimal grossAmount = appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .map(Appointment::getTotalAmount)
                .reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add);

        List<CommissionEntry> entries = barberId != null
                ? commissionEntryRepository.findAllByTenantIdAndBarberIdAndCreatedAtBetween(tenantId, barberId, from, to)
                : commissionEntryRepository.findAllByTenantIdAndCreatedAtBetween(tenantId, from, to);

        BigDecimal commissionAmount = entries.stream()
                .map(CommissionEntry::getCommissionAmount)
                .reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add)
                .setScale(2, RoundingMode.HALF_EVEN);

        return new DashboardOverviewResponse(
                scheduled, completed, canceled, noShow,
                grossAmount.toPlainString(), commissionAmount.toPlainString()
        );
    }

    private int countByStatus(List<Appointment> appointments, AppointmentStatus status) {
        return (int) appointments.stream().filter(a -> a.getStatus() == status).count();
    }
}
