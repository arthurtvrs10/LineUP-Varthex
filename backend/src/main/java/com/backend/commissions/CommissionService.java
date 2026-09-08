package com.backend.commissions;

import com.backend.barbers.BarberProfile;
import com.backend.barbers.BarberRepository;
import com.backend.commissions.dto.CommissionAdjustmentRequest;
import com.backend.commissions.dto.CommissionEntryResponse;
import com.backend.commissions.dto.CommissionRuleRequest;
import com.backend.commissions.dto.CommissionRuleResponse;
import com.backend.commissions.dto.CommissionSummaryResponse;
import com.backend.scheduling.Appointment;
import com.backend.scheduling.AppointmentItem;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CommissionService {

    private final CommissionRuleRepository commissionRuleRepository;
    private final CommissionEntryRepository commissionEntryRepository;
    private final BarberRepository barberRepository;

    public CommissionService(CommissionRuleRepository commissionRuleRepository,
                              CommissionEntryRepository commissionEntryRepository,
                              BarberRepository barberRepository) {
        this.commissionRuleRepository = commissionRuleRepository;
        this.commissionEntryRepository = commissionEntryRepository;
        this.barberRepository = barberRepository;
    }

    @Transactional
    public CommissionRuleResponse createRule(UUID tenantId, CommissionRuleRequest request) {
        validateRule(request);

        CommissionRule rule = new CommissionRule(
                tenantId, request.barberId(), request.serviceId(), request.type(),
                parseOrNull(request.percentage()), parseOrNull(request.fixedAmount()),
                request.validFrom(), request.validTo()
        );

        return toRuleResponse(commissionRuleRepository.save(rule));
    }

    public List<CommissionRuleResponse> listRules(UUID tenantId) {
        return commissionRuleRepository.findAllByTenantId(tenantId).stream()
                .map(this::toRuleResponse)
                .toList();
    }

    @Transactional
    public CommissionRuleResponse updateRule(UUID tenantId, UUID ruleId, CommissionRuleRequest request) {
        validateRule(request);

        CommissionRule rule = commissionRuleRepository.findById(ruleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Regra de comissão não encontrada"));

        if (!rule.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Regra de comissão não encontrada");
        }

        if (request.version() == null || !rule.getVersion().equals(request.version())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A regra foi modificada por outra requisição");
        }

        rule.setType(request.type());
        rule.setPercentage(parseOrNull(request.percentage()));
        rule.setFixedAmount(parseOrNull(request.fixedAmount()));
        rule.setValidFrom(request.validFrom());
        rule.setValidTo(request.validTo());

        return toRuleResponse(commissionRuleRepository.save(rule));
    }

    // Provisiona a comissão de cada item ao concluir o atendimento (RN-COM-002/003).
    // Chamado de dentro da mesma transação de AppointmentService.transitionAppointment.
    @Transactional
    public void provisionForAppointment(Appointment appointment) {
        LocalDateTime at = LocalDateTime.now();

        for (AppointmentItem item : appointment.getItems()) {
            RateSource rate = resolveRate(appointment.getTenantId(), appointment.getBarberId(), item.getServiceId(), at);

            BigDecimal base = item.getUnitPrice().subtract(item.getDiscountAmount());
            BigDecimal percentageAmount = base
                    .multiply(rate.percentage())
                    .divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_EVEN);
            BigDecimal commissionAmount = percentageAmount.add(rate.fixedAmount())
                    .setScale(2, RoundingMode.HALF_EVEN);

            CommissionEntry entry = new CommissionEntry(
                    appointment.getTenantId(), appointment.getId(), item.getId(), appointment.getBarberId(),
                    rate.ruleId(), base.setScale(2, RoundingMode.HALF_EVEN), rate.percentage(), rate.fixedAmount(),
                    commissionAmount, CommissionStatus.PROVISIONED, null, null
            );

            commissionEntryRepository.save(entry);
        }
    }

    @Transactional(readOnly = true)
    public List<CommissionEntryResponse> listEntries(UUID tenantId, LocalDate from, LocalDate to, UUID barberId) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        List<CommissionEntry> entries = barberId != null
                ? commissionEntryRepository.findAllByTenantIdAndBarberIdAndCreatedAtBetweenOrderByCreatedAtDesc(tenantId, barberId, start, end)
                : commissionEntryRepository.findAllByTenantIdAndCreatedAtBetweenOrderByCreatedAtDesc(tenantId, start, end);

        return entries.stream().map(this::toEntryResponse).toList();
    }

    public CommissionSummaryResponse summary(UUID tenantId, LocalDate from, LocalDate to, UUID barberId) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        List<CommissionEntry> entries = barberId != null
                ? commissionEntryRepository.findAllByTenantIdAndBarberIdAndCreatedAtBetween(tenantId, barberId, start, end)
                : commissionEntryRepository.findAllByTenantIdAndCreatedAtBetween(tenantId, start, end);

        BigDecimal provisioned = sumByStatus(entries, CommissionStatus.PROVISIONED);
        BigDecimal approved = sumByStatus(entries, CommissionStatus.APPROVED);
        BigDecimal paid = sumByStatus(entries, CommissionStatus.PAID);

        return new CommissionSummaryResponse(from, to, provisioned.toPlainString(), approved.toPlainString(), paid.toPlainString());
    }

    @Transactional
    public CommissionEntryResponse adjust(UUID tenantId, CommissionAdjustmentRequest request) {
        if (request.barberId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O barbeiro é obrigatório");
        }
        if (request.reason() == null || request.reason().trim().length() < 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O motivo precisa ter pelo menos 10 caracteres");
        }

        BigDecimal amount;
        try {
            amount = new BigDecimal(request.amount()).setScale(2, RoundingMode.HALF_EVEN);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valor inválido");
        }

        CommissionEntry entry = new CommissionEntry(
                tenantId, request.appointmentId(), null, request.barberId(),
                null, BigDecimal.ZERO.setScale(2), BigDecimal.ZERO.setScale(4, RoundingMode.HALF_EVEN),
                BigDecimal.ZERO.setScale(2), amount, CommissionStatus.APPROVED, null, request.reason()
        );

        return toEntryResponse(commissionEntryRepository.save(entry));
    }

    private record RateSource(BigDecimal percentage, BigDecimal fixedAmount, UUID ruleId) {
    }

    // Precedência (RN-COM-001, simplificada — sem nível "item"):
    // 1) regra vigente barbeiro+serviço; 2) regra vigente só barbeiro;
    // 3) BarberProfile.defaultCommissionPercent (padrão sem regra cadastrada).
    private RateSource resolveRate(UUID tenantId, UUID barberId, UUID serviceId, LocalDateTime at) {
        Optional<CommissionRule> rule = commissionRuleRepository.findEffectiveRule(tenantId, barberId, serviceId, at);

        if (rule.isPresent()) {
            CommissionRule r = rule.get();
            BigDecimal percentage = r.getPercentage() != null ? r.getPercentage() : BigDecimal.ZERO;
            BigDecimal fixed = r.getFixedAmount() != null ? r.getFixedAmount() : BigDecimal.ZERO.setScale(2);
            return new RateSource(percentage, fixed, r.getId());
        }

        BarberProfile barber = barberRepository.findById(barberId).orElse(null);
        BigDecimal fallbackPercent = barber != null
                ? BigDecimal.valueOf(barber.getDefaultCommissionPercent())
                : BigDecimal.ZERO;

        return new RateSource(fallbackPercent, BigDecimal.ZERO.setScale(2), null);
    }

    private BigDecimal sumByStatus(List<CommissionEntry> entries, CommissionStatus status) {
        return entries.stream()
                .filter(e -> e.getStatus() == status)
                .map(CommissionEntry::getCommissionAmount)
                .reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add);
    }

    private void validateRule(CommissionRuleRequest request) {
        if (request.type() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O tipo é obrigatório");
        }
        if (request.validFrom() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A vigência inicial é obrigatória");
        }
        if (request.type() != CommissionType.FIXED && (request.percentage() == null || request.percentage().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O percentual é obrigatório para este tipo");
        }
        if (request.type() != CommissionType.PERCENTAGE && (request.fixedAmount() == null || request.fixedAmount().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O valor fixo é obrigatório para este tipo");
        }
    }

    private BigDecimal parseOrNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valor numérico inválido: " + value);
        }
    }

    private CommissionRuleResponse toRuleResponse(CommissionRule rule) {
        return new CommissionRuleResponse(
                rule.getId(), rule.getBarberId(), rule.getServiceId(), rule.getType(),
                rule.getPercentage() != null ? rule.getPercentage().toPlainString() : null,
                rule.getFixedAmount() != null ? rule.getFixedAmount().toPlainString() : null,
                rule.getValidFrom(), rule.getValidTo(), rule.getVersion()
        );
    }

    private CommissionEntryResponse toEntryResponse(CommissionEntry entry) {
        return new CommissionEntryResponse(
                entry.getId(), entry.getBarberId(), entry.getAppointmentId(), entry.getAppointmentItemId(),
                entry.getCommissionRuleId(), entry.getBaseAmount().toPlainString(), entry.getPercentage().toPlainString(),
                entry.getFixedAmount().toPlainString(), entry.getCommissionAmount().toPlainString(),
                entry.getStatus(), entry.getReversalOfId(), entry.getReason(), entry.getCreatedAt()
        );
    }
}
