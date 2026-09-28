package com.backend.commercial;

import com.backend.tenants.*;
import java.time.LocalDate;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

@Service
public class BookingDirectory {
    private final TenantRepository tenants;
    private final SubscriptionRepository subscriptions;
    public BookingDirectory(TenantRepository tenants, SubscriptionRepository subscriptions) {
        this.tenants = tenants;
        this.subscriptions = subscriptions;
    }
    public boolean available(Tenant tenant) {
        if (tenant.getStatus() != TenantStatus.ACTIVE && tenant.getStatus() != TenantStatus.TRIAL) return false;
        return accessible(tenant);
    }
    public boolean accessible(Tenant tenant) {
        if (tenant.getStatus() == TenantStatus.SUSPENDED || tenant.getStatus() == TenantStatus.CANCELED) return false;
        var subscription = subscriptions.findAllByTenantId(tenant.getId()).stream().findFirst();
        return subscription.map(s -> ("ACTIVE".equals(s.status) || "TRIAL".equals(s.status))
                && !s.startsOn.isAfter(LocalDate.now()) && !s.endsOn.isBefore(LocalDate.now())).orElse(true);
    }
    public record Shop(UUID id, String name, String slug) {}
    public List<Shop> list(String query) {
        String search = query == null ? "" : query.strip().toLowerCase(Locale.ROOT);
        return tenants.findAll().stream().filter(this::available)
                .filter(t -> t.getTradeName().toLowerCase(Locale.ROOT).contains(search))
                .sorted(Comparator.comparing(Tenant::getTradeName, String.CASE_INSENSITIVE_ORDER))
                .map(t -> new Shop(t.getId(), t.getTradeName(), t.getSlug())).toList();
    }
}

@RestController
@RequestMapping("/me/barbershops")
class BookingDirectoryController {
    private final BookingDirectory directory;
    BookingDirectoryController(BookingDirectory directory) { this.directory = directory; }
    @GetMapping
    public List<BookingDirectory.Shop> list(@RequestParam(required = false) String q) { return directory.list(q); }
}
