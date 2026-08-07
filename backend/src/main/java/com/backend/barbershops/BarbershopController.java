package com.backend.barbershops;

import com.backend.barbershops.dto.BarbershopResponse;
import com.backend.barbershops.dto.BarbershopSummaryResponse;
import com.backend.barbershops.dto.CreateBarbershopRequest;
import com.backend.barbershops.dto.UpdateBarbershopRequest;
import com.backend.users.dto.UserResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/barbershops")
public class BarbershopController {
    private final BarbershopService barbershopService;

    public BarbershopController(BarbershopService barbershopService) {
        this.barbershopService = barbershopService;
    }

    @PostMapping
    public BarbershopResponse createBarbershop(@RequestBody CreateBarbershopRequest request){
        Barbershop barbershop = barbershopService.createBarbershop(
                request.name(),
                request.documentType(),
                request.documentNumber(),
                request.email(),
                request.phone(),
                request.timezone()
        );

        return toResponse(barbershop);
    }

    @GetMapping
    public List<BarbershopSummaryResponse> getBarbershops(){
        List<Barbershop> barbershops = barbershopService.listBarbershops();

        return barbershops.stream()
                .map(barbershop -> new BarbershopSummaryResponse(
                        barbershop.getId(),
                        barbershop.getName(),
                        barbershop.getEmail(),
                        barbershop.getPhone(),
                        barbershop.getStatus()
                ))
                .toList();
    }

    @GetMapping("/{id}")
    public BarbershopResponse getBarbershopById(@PathVariable UUID id){
        Barbershop barbershop = barbershopService.findById(id);

        return toResponse(barbershop);
    }

    @PatchMapping("/{id}")
    public BarbershopResponse updateBarbershop(@PathVariable UUID id,
                                               @RequestBody UpdateBarbershopRequest request){
        Barbershop barbershop = barbershopService.updateBarbershop(
                id,
                request.name(),
                request.phone(),
                request.email(),
                request.timezone()
        );

        return toResponse(barbershop);
    }

    @PatchMapping("/{id}/block")
    public BarbershopResponse blockBarbershop(@PathVariable UUID id){
        Barbershop barbershop = barbershopService.blockBarbershop(id);

        return toResponse(barbershop);
    }

    @PatchMapping("/{id}/activate")
    public BarbershopResponse patchBarbershopStatus(@PathVariable UUID id){
        Barbershop barbershop = barbershopService.activateBarbershop(id);

        return toResponse(barbershop);
    }

    private BarbershopResponse toResponse(Barbershop barbershop){
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
