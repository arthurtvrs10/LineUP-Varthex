package com.backend.scheduling.dto;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
public record AppointmentRescheduleRequest(@NotNull LocalDateTime startAt, Long version) {}
