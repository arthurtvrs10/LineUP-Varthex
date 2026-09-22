package com.backend.commercial;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CashRegisterRepository extends JpaRepository<CashRegister, UUID> {
    java.util.List<CashRegister> findAllByTenantId(UUID tenantId);
}
