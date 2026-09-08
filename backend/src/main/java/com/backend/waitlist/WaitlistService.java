package com.backend.waitlist;

import com.backend.barbers.BarberProfile;
import com.backend.barbers.BarberRepository;
import com.backend.customers.Customer;
import com.backend.customers.CustomerRepository;
import com.backend.services.ServiceOffering;
import com.backend.services.ServiceOfferingRepository;
import com.backend.units.UnitRepository;
import com.backend.waitlist.dto.WaitlistEntryRequest;
import com.backend.waitlist.dto.WaitlistEntryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

// Escopo simplificado deste incremento (RF-FIL): só a fila em si —
// cadastrar, listar, cancelar. O mecanismo de "oferta" (RN-FIL-003/004,
// notificar o primeiro compatível e reservar o slot por um prazo) fica
// pra uma próxima rodada — hoje o encaixe da vaga em si é feito manualmente
// pelo staff criando o agendamento normal e cancelando a entrada da fila.
@Service
public class WaitlistService {

    private final WaitlistEntryRepository waitlistEntryRepository;
    private final CustomerRepository customerRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final BarberRepository barberRepository;
    private final UnitRepository unitRepository;

    public WaitlistService(WaitlistEntryRepository waitlistEntryRepository,
                            CustomerRepository customerRepository,
                            ServiceOfferingRepository serviceOfferingRepository,
                            BarberRepository barberRepository,
                            UnitRepository unitRepository) {
        this.waitlistEntryRepository = waitlistEntryRepository;
        this.customerRepository = customerRepository;
        this.serviceOfferingRepository = serviceOfferingRepository;
        this.barberRepository = barberRepository;
        this.unitRepository = unitRepository;
    }

    @Transactional
    public WaitlistEntryResponse create(UUID tenantId, WaitlistEntryRequest request, UUID restrictCustomerId) {
        UUID customerId = restrictCustomerId != null ? restrictCustomerId : request.customerId();

        if (request.unitId() == null || customerId == null || request.serviceId() == null
                || request.windowStartAt() == null || request.windowEndAt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados obrigatórios faltando");
        }
        if (!request.windowEndAt().isAfter(request.windowStartAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A janela final deve ser depois da inicial");
        }

        requireSameTenant(unitRepository.findById(request.unitId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unidade não encontrada"))
                        .getTenant().getId(),
                tenantId, "Unidade não encontrada");

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente não encontrado"));
        requireSameTenant(customer.getTenantId(), tenantId, "Cliente não encontrado");

        ServiceOffering service = serviceOfferingRepository.findById(request.serviceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Serviço não encontrado"));
        requireSameTenant(service.getTenantId(), tenantId, "Serviço não encontrado");

        if (request.preferredBarberId() != null) {
            BarberProfile barber = barberRepository.findById(request.preferredBarberId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profissional não encontrado"));
            requireSameTenant(barber.getUnit().getTenant().getId(), tenantId, "Profissional não encontrado");
        }

        WaitlistEntry entry = new WaitlistEntry(
                tenantId, request.unitId(), customerId, request.serviceId(), request.preferredBarberId(),
                request.windowStartAt(), request.windowEndAt(), request.notes()
        );

        return toResponse(waitlistEntryRepository.save(entry));
    }

    @Transactional(readOnly = true)
    public List<WaitlistEntryResponse> list(UUID tenantId, UUID restrictCustomerId) {
        List<WaitlistEntry> entries = restrictCustomerId != null
                ? waitlistEntryRepository.findAllByTenantIdAndCustomerIdOrderByCreatedAtDesc(tenantId, restrictCustomerId)
                : waitlistEntryRepository.findAllByTenantIdAndStatusOrderByCreatedAtAsc(tenantId, WaitlistStatus.ACTIVE);

        return entries.stream().map(this::toResponse).toList();
    }

    @Transactional
    public void cancel(UUID tenantId, UUID entryId, UUID restrictCustomerId) {
        WaitlistEntry entry = waitlistEntryRepository.findById(entryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrada não encontrada"));

        if (!entry.getTenantId().equals(tenantId)
                || (restrictCustomerId != null && !restrictCustomerId.equals(entry.getCustomerId()))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrada não encontrada");
        }

        entry.setStatus(WaitlistStatus.CANCELED);
        waitlistEntryRepository.save(entry);
    }

    private void requireSameTenant(UUID actualTenantId, UUID expectedTenantId, String message) {
        if (!expectedTenantId.equals(actualTenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private WaitlistEntryResponse toResponse(WaitlistEntry entry) {
        String customerName = customerRepository.findById(entry.getCustomerId())
                .map(Customer::getFullName).orElse(null);
        String serviceName = serviceOfferingRepository.findById(entry.getServiceId())
                .map(ServiceOffering::getName).orElse(null);
        String barberName = entry.getPreferredBarberId() != null
                ? barberRepository.findById(entry.getPreferredBarberId()).map(BarberProfile::getDisplayName).orElse(null)
                : null;

        return new WaitlistEntryResponse(
                entry.getId(), entry.getUnitId(), entry.getCustomerId(), customerName,
                entry.getServiceId(), serviceName, entry.getPreferredBarberId(), barberName,
                entry.getWindowStartAt(), entry.getWindowEndAt(), entry.getStatus(), entry.getNotes(),
                entry.getCreatedAt()
        );
    }
}
