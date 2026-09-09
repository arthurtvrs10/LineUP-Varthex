package com.backend.waitlist;

import com.backend.barbers.BarberProfile;
import com.backend.barbers.BarberRepository;
import com.backend.customers.Customer;
import com.backend.customers.CustomerRepository;
import com.backend.notifications.NotificationService;
import com.backend.notifications.NotificationType;
import com.backend.scheduling.AppointmentChannel;
import com.backend.scheduling.AppointmentRepository;
import com.backend.scheduling.AppointmentService;
import com.backend.scheduling.dto.AppointmentCreateRequest;
import com.backend.scheduling.dto.AppointmentItemInputRequest;
import com.backend.scheduling.dto.AppointmentResponse;
import com.backend.services.ServiceOffering;
import com.backend.services.ServiceOfferingRepository;
import com.backend.units.UnitRepository;
import com.backend.waitlist.dto.WaitlistEntryRequest;
import com.backend.waitlist.dto.WaitlistEntryResponse;
import com.backend.waitlist.dto.WaitlistOfferRequest;
import com.backend.waitlist.dto.WaitlistOfferResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class WaitlistService {

    // RN-FIL-003: prazo que o cliente tem pra confirmar a vaga oferecida
    // antes dela expirar — sem campo configurável por tenant ainda
    // (Tenant.waitlistOfferMinutes do plano original), valor fixo por ora.
    private static final int OFFER_VALID_MINUTES = 30;
    private static final DateTimeFormatter WHEN_FORMAT = DateTimeFormatter.ofPattern("dd/MM 'às' HH:mm");

    private final WaitlistEntryRepository waitlistEntryRepository;
    private final WaitlistOfferRepository waitlistOfferRepository;
    private final CustomerRepository customerRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final BarberRepository barberRepository;
    private final UnitRepository unitRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentService appointmentService;
    private final NotificationService notificationService;

    public WaitlistService(WaitlistEntryRepository waitlistEntryRepository,
                            WaitlistOfferRepository waitlistOfferRepository,
                            CustomerRepository customerRepository,
                            ServiceOfferingRepository serviceOfferingRepository,
                            BarberRepository barberRepository,
                            UnitRepository unitRepository,
                            AppointmentRepository appointmentRepository,
                            AppointmentService appointmentService,
                            NotificationService notificationService) {
        this.waitlistEntryRepository = waitlistEntryRepository;
        this.waitlistOfferRepository = waitlistOfferRepository;
        this.customerRepository = customerRepository;
        this.serviceOfferingRepository = serviceOfferingRepository;
        this.barberRepository = barberRepository;
        this.unitRepository = unitRepository;
        this.appointmentRepository = appointmentRepository;
        this.appointmentService = appointmentService;
        this.notificationService = notificationService;
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
        WaitlistEntry entry = findEntryForTenant(tenantId, entryId, restrictCustomerId);

        entry.setStatus(WaitlistStatus.CANCELED);
        waitlistEntryRepository.save(entry);
    }

    // RN-FIL-003: staff oferta a vaga pro dono da entrada — valida
    // compatibilidade (profissional preferido, se houver) e que o horário
    // está mesmo livre antes de notificar o cliente.
    @Transactional
    public WaitlistOfferResponse createOffer(UUID tenantId, UUID entryId, WaitlistOfferRequest request) {
        WaitlistEntry entry = findEntryForTenant(tenantId, entryId, null);

        if (entry.getStatus() != WaitlistStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta entrada não está mais ativa na fila");
        }
        if (request.barberId() == null || request.slotStartAt() == null || request.slotEndAt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profissional e horário são obrigatórios");
        }
        if (entry.getPreferredBarberId() != null && !entry.getPreferredBarberId().equals(request.barberId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este cliente só aceita o profissional preferido");
        }

        BarberProfile barber = barberRepository.findById(request.barberId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profissional não encontrado"));
        requireSameTenant(barber.getUnit().getTenant().getId(), tenantId, "Profissional não encontrado");

        if (appointmentRepository.hasConflict(request.barberId(), request.slotStartAt(), request.slotEndAt(), null)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esse horário não está livre para o profissional");
        }

        WaitlistOffer offer = createOfferAndNotify(tenantId, entry, request.barberId(), request.slotStartAt(), request.slotEndAt());
        return toOfferResponse(offer);
    }

    private WaitlistOffer createOfferAndNotify(UUID tenantId, WaitlistEntry entry, UUID barberId,
                                                LocalDateTime slotStartAt, LocalDateTime slotEndAt) {
        WaitlistOffer offer = new WaitlistOffer(
                entry.getId(), barberId, slotStartAt, slotEndAt,
                LocalDateTime.now().plusMinutes(OFFER_VALID_MINUTES)
        );
        waitlistOfferRepository.save(offer);

        Customer customer = customerRepository.findById(entry.getCustomerId()).orElse(null);
        String barberName = barberRepository.findById(barberId).map(BarberProfile::getDisplayName).orElse("");
        if (customer != null) {
            String when = slotStartAt.format(WHEN_FORMAT);
            String message = "Uma vaga abriu em " + when + " com " + barberName
                    + ". Você tem " + OFFER_VALID_MINUTES + " minutos para confirmar.";
            String html = "<p>" + message + "</p>";

            notificationService.notifyCustomer(
                    tenantId, customer, NotificationType.WAITLIST_OFFER,
                    "Vaga disponível!", message,
                    "Vaga disponível — LINEUP", html,
                    "WAITLIST_OFFER", offer.getId()
            );
        }

        return offer;
    }

    // RN-FIL-003/004, extensão: quando o cliente recusa, a vaga não fica
    // parada — reoferta pro próximo da fila (FIFO) que espera o mesmo
    // serviço na mesma unidade e aceita esse profissional. Sem job/fila:
    // só reage a uma recusa explícita (expiração por tempo é passiva, sem
    // gatilho pra reagir — mesma simplificação de "expiração preguiçosa"
    // já usada em WaitlistOffer.isPending()).
    private void reofertarProximoDaFila(UUID tenantId, WaitlistEntry entryRejeitada, WaitlistOffer offerRejeitada) {
        if (appointmentRepository.hasConflict(offerRejeitada.getBarberId(), offerRejeitada.getSlotStartAt(),
                offerRejeitada.getSlotEndAt(), null)) {
            return;
        }

        List<WaitlistEntry> candidatos = waitlistEntryRepository
                .findAllByTenantIdAndStatusOrderByCreatedAtAsc(tenantId, WaitlistStatus.ACTIVE);

        candidatos.stream()
                .filter(c -> !c.getId().equals(entryRejeitada.getId()))
                .filter(c -> c.getUnitId().equals(entryRejeitada.getUnitId()))
                .filter(c -> c.getServiceId().equals(entryRejeitada.getServiceId()))
                .filter(c -> c.getPreferredBarberId() == null || c.getPreferredBarberId().equals(offerRejeitada.getBarberId()))
                .findFirst()
                .ifPresent(proximo -> createOfferAndNotify(
                        tenantId, proximo, offerRejeitada.getBarberId(),
                        offerRejeitada.getSlotStartAt(), offerRejeitada.getSlotEndAt()
                ));
    }

    // RN-FIL-004: primeira aceitação transacional válida vira agendamento —
    // reconfere o conflito aqui dentro (mesma transação) porque o horário
    // pode ter sido preenchido por outra via entre a oferta e a aceitação.
    @Transactional
    public AppointmentResponse acceptOffer(UUID tenantId, UUID offerId, UUID restrictCustomerId) {
        WaitlistOffer offer = waitlistOfferRepository.findById(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Oferta não encontrada"));
        WaitlistEntry entry = findEntryForTenant(tenantId, offer.getWaitlistEntryId(), restrictCustomerId);

        if (!offer.isPending()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta oferta expirou ou já foi respondida");
        }

        if (appointmentRepository.hasConflict(offer.getBarberId(), offer.getSlotStartAt(), offer.getSlotEndAt(), null)) {
            offer.setStatus(WaitlistOfferStatus.EXPIRED);
            waitlistOfferRepository.save(offer);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esse horário não está mais disponível");
        }

        offer.setStatus(WaitlistOfferStatus.ACCEPTED);
        waitlistOfferRepository.save(offer);

        entry.setStatus(WaitlistStatus.BOOKED);
        waitlistEntryRepository.save(entry);

        AppointmentCreateRequest appointmentRequest = new AppointmentCreateRequest(
                entry.getUnitId(), entry.getCustomerId(), offer.getBarberId(), offer.getSlotStartAt(),
                List.of(new AppointmentItemInputRequest(entry.getServiceId())),
                AppointmentChannel.CLIENT_WEB, "Encaixe da fila de espera"
        );

        return appointmentService.createAppointment(tenantId, appointmentRequest, entry.getCustomerId());
    }

    @Transactional
    public void rejectOffer(UUID tenantId, UUID offerId, UUID restrictCustomerId) {
        WaitlistOffer offer = waitlistOfferRepository.findById(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Oferta não encontrada"));
        WaitlistEntry entry = findEntryForTenant(tenantId, offer.getWaitlistEntryId(), restrictCustomerId);

        if (!offer.isPending()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta oferta expirou ou já foi respondida");
        }

        offer.setStatus(WaitlistOfferStatus.REJECTED);
        waitlistOfferRepository.save(offer);

        reofertarProximoDaFila(tenantId, entry, offer);
    }

    @Transactional(readOnly = true)
    public List<WaitlistOfferResponse> listOffers(UUID tenantId, UUID entryId, UUID restrictCustomerId) {
        findEntryForTenant(tenantId, entryId, restrictCustomerId);
        return waitlistOfferRepository.findAllByWaitlistEntryIdOrderByCreatedAtDesc(entryId).stream()
                .map(this::toOfferResponse)
                .toList();
    }

    private WaitlistEntry findEntryForTenant(UUID tenantId, UUID entryId, UUID restrictCustomerId) {
        WaitlistEntry entry = waitlistEntryRepository.findById(entryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrada não encontrada"));

        if (!entry.getTenantId().equals(tenantId)
                || (restrictCustomerId != null && !restrictCustomerId.equals(entry.getCustomerId()))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrada não encontrada");
        }

        return entry;
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

    private WaitlistOfferResponse toOfferResponse(WaitlistOffer offer) {
        String barberName = barberRepository.findById(offer.getBarberId()).map(BarberProfile::getDisplayName).orElse(null);
        return new WaitlistOfferResponse(
                offer.getId(), offer.getWaitlistEntryId(), offer.getBarberId(), barberName,
                offer.getSlotStartAt(), offer.getSlotEndAt(), offer.getStatus(), offer.getExpiresAt(), offer.getCreatedAt()
        );
    }
}
