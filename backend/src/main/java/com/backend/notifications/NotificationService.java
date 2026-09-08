package com.backend.notifications;

import com.backend.customers.Customer;
import com.backend.email.EmailService;
import com.backend.notifications.dto.NotificationResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    public NotificationService(NotificationRepository notificationRepository, EmailService emailService) {
        this.notificationRepository = notificationRepository;
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

        if (customer.getEmail() != null && !customer.getEmail().isBlank()) {
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

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getType(), n.getTitle(), n.getMessage(),
                n.getReferenceType(), n.getReferenceId(), n.getReadAt(), n.getCreatedAt()
        );
    }
}
