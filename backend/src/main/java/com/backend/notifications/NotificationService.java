package com.backend.notifications;

import com.backend.customers.Customer;
import com.backend.email.EmailService;
import com.backend.notifications.dto.NotificationPreferenceResponse;
import com.backend.notifications.dto.NotificationResponse;
import com.backend.notifications.dto.UpdateNotificationPreferenceRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class NotificationService {

    // RF-NOT-004: confirmação/cancelamento nunca podem ser desligados por
    // e-mail — são a única forma confiável do cliente saber do agendamento
    // se ele não estiver de olho no app. Oferta de vaga fica livre pra
    // desligar (quem confere o app com frequência pode preferir só in-app).
    private static final Set<NotificationType> MANDATORY_EMAIL_TYPES = Set.of(
            NotificationType.APPOINTMENT_CONFIRMED, NotificationType.APPOINTMENT_CANCELED
    );

    // Tipos que fazem sentido perguntar "quer e-mail disso?" — de proposito
    // não inclui APPOINTMENT_CREATED, que hoje só notifica o barbeiro
    // in-app, nunca por e-mail.
    private static final List<NotificationType> CUSTOMER_EMAIL_TYPES = List.of(
            NotificationType.APPOINTMENT_CONFIRMED, NotificationType.APPOINTMENT_CANCELED, NotificationType.WAITLIST_OFFER
    );

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final EmailService emailService;

    public NotificationService(NotificationRepository notificationRepository,
                                NotificationPreferenceRepository notificationPreferenceRepository,
                                EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.notificationPreferenceRepository = notificationPreferenceRepository;
        this.emailService = emailService;
    }

    // Notificação de equipe (barbeiro/admin) — só in-app neste incremento
    // (RF-NOT essencial); um digest por e-mail para staff fica pra depois.
    @Transactional
    public void notifyUser(UUID tenantId, UUID userId, NotificationType type, String title, String message,
                            String referenceType, UUID referenceId) {
        Notification notification = new Notification(
                tenantId, userId, null, NotificationChannel.IN_APP, type, title, message,
                referenceType, referenceId, NotificationStatus.SENT
        );
        notificationRepository.save(notification);
    }

    // Notificação de cliente: in-app só se ele já tem conta vinculada (senão
    // não existe ninguém logado pra ver); e-mail sempre que há endereço
    // cadastrado, independente de ter conta — RF-NOT-001.
    @Transactional
    public void notifyCustomer(UUID tenantId, Customer customer, NotificationType type, String title,
                                String message, String emailSubject, String emailHtml,
                                String referenceType, UUID referenceId) {
        if (customer.getUserId() != null) {
            Notification inApp = new Notification(
                    tenantId, customer.getUserId(), customer.getId(), NotificationChannel.IN_APP, type,
                    title, message, referenceType, referenceId, NotificationStatus.SENT
            );
            notificationRepository.save(inApp);
        }

        if (customer.getEmail() != null && !customer.getEmail().isBlank()
                && isEmailEnabled(customer.getUserId(), type)) {
            boolean sent = emailService.sendNotificationEmail(customer.getEmail(), emailSubject, emailHtml);
            Notification email = new Notification(
                    tenantId, customer.getUserId(), customer.getId(), NotificationChannel.EMAIL, type,
                    title, message, referenceType, referenceId, sent ? NotificationStatus.SENT : NotificationStatus.FAILED
            );
            notificationRepository.save(email);
        }
    }

    public List<NotificationResponse> list(UUID tenantId, UUID userId) {
        return notificationRepository
                .findAllByTenantIdAndRecipientUserIdAndChannelOrderByCreatedAtDesc(tenantId, userId, NotificationChannel.IN_APP)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void markRead(UUID tenantId, UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findByIdAndTenantIdAndRecipientUserId(notificationId, tenantId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificação não encontrada"));

        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllRead(UUID tenantId, UUID userId) {
        List<Notification> unread = notificationRepository
                .findAllByTenantIdAndRecipientUserIdAndChannelAndReadAtIsNull(tenantId, userId, NotificationChannel.IN_APP);

        LocalDateTime now = LocalDateTime.now();
        unread.forEach(n -> n.setReadAt(now));
        notificationRepository.saveAll(unread);
    }

    private boolean isEmailEnabled(UUID userId, NotificationType type) {
        if (userId == null || MANDATORY_EMAIL_TYPES.contains(type)) {
            return true;
        }
        return notificationPreferenceRepository.findByUserIdAndType(userId, type)
                .map(NotificationPreference::isEmailEnabled)
                .orElse(true);
    }

    public List<NotificationPreferenceResponse> listPreferences(UUID userId) {
        return CUSTOMER_EMAIL_TYPES.stream()
                .map(type -> new NotificationPreferenceResponse(type, isEmailEnabled(userId, type), MANDATORY_EMAIL_TYPES.contains(type)))
                .toList();
    }

    // Ignora silenciosamente tentativas de desligar um tipo obrigatório —
    // "respeitar preferências obrigatórias" (RF-NOT-004) sem precisar
    // rejeitar a requisição inteira por causa de um item.
    @Transactional
    public void updatePreferences(UUID userId, List<UpdateNotificationPreferenceRequest> updates) {
        for (UpdateNotificationPreferenceRequest update : updates) {
            if (MANDATORY_EMAIL_TYPES.contains(update.type())) {
                continue;
            }

            NotificationPreference preference = notificationPreferenceRepository
                    .findByUserIdAndType(userId, update.type())
                    .orElseGet(() -> new NotificationPreference(userId, update.type(), true));

            preference.setEmailEnabled(update.emailEnabled());
            notificationPreferenceRepository.save(preference);
        }
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getType(), n.getTitle(), n.getMessage(),
                n.getReferenceType(), n.getReferenceId(), n.getReadAt(), n.getCreatedAt()
        );
    }
}
