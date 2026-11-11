package com.backend.barbers.auth;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity @Table(name="email_verification_tokens")
public class EmailVerificationToken {
    @Id public UUID userId;
    @Column(nullable=false,unique=true,length=64) public String tokenHash;
    public LocalDateTime expiresAt;
    public LocalDateTime sentAt;
    public LocalDateTime usedAt;
}
