package com.backend.availability;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, UUID> {

    List<WorkSchedule> findAllByBarberId(UUID barberId);

    // Mais de uma faixa por dia é permitido (ex.: manhã + tarde com intervalo
    // de almoço no meio) — RF-DIS-001 fala em "faixas", no plural.
    List<WorkSchedule> findAllByBarberIdAndWeekday(UUID barberId, int weekday);

    void deleteAllByBarberId(UUID barberId);
}
