package com.backend.customers;

import com.backend.commercial.BookingDirectory;
import com.backend.tenants.*;
import com.backend.users.*;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClientBarbershopSelection {
    private final UserRepository users;
    private final TenantRepository tenants;
    private final CustomerRepository customers;
    private final BookingDirectory directory;

    public ClientBarbershopSelection(UserRepository users, TenantRepository tenants, CustomerRepository customers, BookingDirectory directory) {
        this.users = users; this.tenants = tenants; this.customers = customers; this.directory = directory;
    }

    public BookingDirectory.Shop current(UUID userId) {
        User user = users.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada"));
        if (user.getPreferredTenantId() != null) {
            // Keep a closed shop selected too: recovery/change belongs in Settings, not onboarding.
            return tenants.findById(user.getPreferredTenantId()).map(this::shop).orElse(null);
        }
        // A CRM record selects the catalog, but does not grant access to its history.
        // Claiming historical data still requires verified email during the first reservation.
        var records = customers.findInitialBarbershops(userId, user.getEmail());
        return records.stream().filter(c -> userId.equals(c.getUserId()))
                .findFirst().or(() -> records.stream().findFirst())
                .flatMap(c -> tenants.findById(c.getTenantId())).map(this::shop).orElse(null);
    }

    @Transactional
    public BookingDirectory.Shop choose(UUID userId, UUID tenantId) {
        if (tenantId == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escolha uma barbearia");
        Tenant tenant = tenants.findById(tenantId).filter(directory::available)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esta barbearia está indisponível"));
        User user = users.findLockedById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada"));
        if (user.getRole() != Role.CLIENT || user.getStatus() != UserStatus.ACTIVE)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta indisponível");
        user.setPreferredTenantId(tenantId);
        users.save(user);
        return shop(tenant);
    }

    private BookingDirectory.Shop shop(Tenant t) { return new BookingDirectory.Shop(t.getId(), t.getTradeName(), t.getSlug()); }
}
