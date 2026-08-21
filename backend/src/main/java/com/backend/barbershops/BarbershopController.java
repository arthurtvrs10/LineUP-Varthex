package com.backend.barbershops;

import com.backend.barbershops.dto.BarbershopResponse;
import com.backend.barbershops.dto.BarbershopSummaryResponse;
import com.backend.barbershops.dto.CreateBarbershopRequest;
import com.backend.barbershops.dto.UpdateBarbershopRequest;
import com.backend.users.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/barbershops")
public class BarbershopController {

    private final BarbershopService barbershopService;
    private final UserService userService;

    public BarbershopController(
            BarbershopService barbershopService,
            UserService userService
    ) {
        this.barbershopService = barbershopService;
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public BarbershopResponse createBarbershop(
            @RequestBody CreateBarbershopRequest request,
            JwtAuthenticationToken authentication
    ) {
        if (authentication == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Usuário não autenticado"
            );
        }

        UUID authenticatedUserId;

        try {
            authenticatedUserId =
                    UUID.fromString(authentication.getName());

            userService.findById(authenticatedUserId);
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "O usuário deste token não existe. Faça login novamente."
            );
        }

        String role = authentication
                .getToken()
                .getClaimAsString("role");

        Barbershop barbershop =
                barbershopService.createBarbershop(
                        request.name(),
                        request.documentType(),
                        request.documentNumber(),
                        request.phone(),
                        request.email(),
                        request.timezone()
                );

        if ("ADMIN".equals(role)) {
            userService.assignBarbershop(
                    authenticatedUserId,
                    barbershop.getId()
            );
        }

        return toResponse(barbershop);
    }

    @GetMapping
    public List<BarbershopSummaryResponse> getBarbershops() {
        return barbershopService.listBarbershops()
                .stream()
                .map(barbershop ->
                        new BarbershopSummaryResponse(
                                barbershop.getId(),
                                barbershop.getName(),
                                barbershop.getEmail(),
                                barbershop.getPhone(),
                                barbershop.getStatus()
                        )
                )
                .toList();
    }

    @GetMapping("/{id}")
    public BarbershopResponse getBarbershopById(
            @PathVariable UUID id
    ) {
        return toResponse(
                barbershopService.findById(id)
        );
    }

    @PatchMapping("/{id}")
    public BarbershopResponse updateBarbershop(
            @PathVariable UUID id,
            @RequestBody UpdateBarbershopRequest request
    ) {
        Barbershop barbershop =
                barbershopService.updateBarbershop(
                        id,
                        request.name(),
                        request.phone(),
                        request.email(),
                        request.timezone()
                );

        return toResponse(barbershop);
    }

    @PatchMapping("/{id}/block")
    public BarbershopResponse blockBarbershop(
            @PathVariable UUID id
    ) {
        return toResponse(
                barbershopService.blockBarbershop(id)
        );
    }

    @PatchMapping("/{id}/activate")
    public BarbershopResponse activateBarbershop(
            @PathVariable UUID id
    ) {
        return toResponse(
                barbershopService.activateBarbershop(id)
        );
    }

    private BarbershopResponse toResponse(
            Barbershop barbershop
    ) {
        return new BarbershopResponse(
                barbershop.getId(),
                barbershop.getName(),
                barbershop.getDocumentType(),
                barbershop.getDocumentNumber(),
                barbershop.getPhone(),
                barbershop.getEmail(),
                barbershop.getStatus(),
                barbershop.getTimezone(),
                barbershop.getCreatedAt(),
                barbershop.getUpdatedAt()
        );
    }
}