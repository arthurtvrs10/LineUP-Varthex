package com.backend.barbers;

import com.backend.barbershops.Barbershop;
import com.backend.users.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "barber_profiles")
@Getter
@Setter
@NoArgsConstructor
public class BarberProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "barbershop_id",
            nullable = false
    )
    private Barbershop barbershop;

    @Column(nullable = false, length = 150)
    private String displayName;

    @Column(length = 1000)
    private String bio;

    @Column(nullable = false)
    private int defaultCommissionPercent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BarberStatus status;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}