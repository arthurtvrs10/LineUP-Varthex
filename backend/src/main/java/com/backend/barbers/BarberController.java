package com.backend.barbers;

import com.backend.barbers.dto.BarberResponse;
import com.backend.barbers.dto.CreateBarberRequest;
import com.backend.barbers.dto.UpdateBarberRequest;
import com.backend.barbers.dto.UpdateBarberStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/barbers")
@RequiredArgsConstructor
public class BarberController {

    private final BarberService barberService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BarberResponse createBarber(
            @Valid @RequestBody CreateBarberRequest request
    ) {
        return barberService.createBarber(request);
    }

    @GetMapping
    public List<BarberResponse> getBarbers(
            @RequestParam("unitId") UUID unitId
    ) {
        return barberService.listByUnit(unitId);
    }

    @GetMapping("/{id}")
    public BarberResponse getBarberById(
            @PathVariable("id") UUID id
    ) {
        return barberService.findById(id);
    }

    @PatchMapping("/{id}")
    public BarberResponse updateBarber(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateBarberRequest request
    ) {
        return barberService.updateBarber(id, request);
    }

    @PatchMapping("/{id}/status")
    public BarberResponse changeStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateBarberStatusRequest request
    ) {
        return barberService.changeStatus(
                id,
                request.status()
        );
    }
}