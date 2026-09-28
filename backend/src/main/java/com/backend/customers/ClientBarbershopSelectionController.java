package com.backend.customers;

import com.backend.commercial.BookingDirectory;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/me/barbershop-selection")
public class ClientBarbershopSelectionController {
    private final ClientBarbershopSelection selection;
    public ClientBarbershopSelectionController(ClientBarbershopSelection selection) { this.selection = selection; }
    public record Choice(UUID tenantId) {}

    @GetMapping
    public ResponseEntity<BookingDirectory.Shop> current(JwtAuthenticationToken auth) {
        var shop = selection.current(UUID.fromString(auth.getToken().getSubject()));
        return shop == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(shop);
    }

    @PostMapping
    public BookingDirectory.Shop choose(@RequestBody Choice choice, JwtAuthenticationToken auth) {
        return selection.choose(UUID.fromString(auth.getToken().getSubject()), choice.tenantId());
    }
}
