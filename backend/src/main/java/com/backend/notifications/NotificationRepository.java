package com.backend.notifications;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findAllByTenantIdAndRecipientUserIdAndChannelOrderByCreatedAtDesc(
            UUID tenantId, UUID recipientUserId, NotificationChannel channel);

    Optional<Notification> findByIdAndTenantIdAndRecipientUserId(UUID id, UUID tenantId, UUID recipientUserId);

    List<Notification> findAllByTenantIdAndRecipientUserIdAndChannelAndReadAtIsNull(
            UUID tenantId, UUID recipientUserId, NotificationChannel channel);
}
