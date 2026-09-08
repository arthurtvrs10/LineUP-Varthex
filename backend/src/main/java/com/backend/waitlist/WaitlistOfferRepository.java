package com.backend.waitlist;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WaitlistOfferRepository extends JpaRepository<WaitlistOffer, UUID> {

    List<WaitlistOffer> findAllByWaitlistEntryIdOrderByCreatedAtDesc(UUID waitlistEntryId);
}
