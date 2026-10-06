package com.backend.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BillingAddonRepository extends JpaRepository<BillingAddon, UUID> {}
