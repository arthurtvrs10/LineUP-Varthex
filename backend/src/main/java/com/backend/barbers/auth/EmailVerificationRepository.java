package com.backend.barbers.auth;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface EmailVerificationRepository extends JpaRepository<EmailVerificationToken,UUID> {
    Optional<EmailVerificationToken> findByTokenHash(String hash);
}
