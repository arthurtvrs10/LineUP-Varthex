package com.backend.units;

import com.backend.units.dto.UnitInputRequest;
import com.backend.units.dto.UnitResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class UnitService {

    private final UnitRepository unitRepository;

    public UnitService(UnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    public UnitResponse getCurrentUnit(UUID tenantId) {
        return toResponse(findCurrentUnit(tenantId));
    }

    @Transactional
    public UnitResponse updateCurrentUnit(UUID tenantId, UnitInputRequest request) {
        Unit unit = findCurrentUnit(tenantId);

        unit.setName(request.name());
        unit.setDocument(request.document());
        unit.setEmail(request.email());
        unit.setPhone(request.phone());
        unit.setStreet(request.street());
        unit.setNumber(request.number());
        unit.setComplement(request.complement());
        unit.setDistrict(request.district());
        unit.setCity(request.city());
        unit.setState(request.state());
        if (request.country() != null) {
            unit.setCountry(request.country());
        }
        unit.setTimeZone(request.timeZone());
        unit.setActive(request.active());

        return toResponse(unitRepository.save(unit));
    }

    // MVP trata "a unidade" como singular por tenant — CRUD de múltiplas
    // unidades (/units, plural) é FINAL no OpenAPI, fora deste escopo.
    private Unit findCurrentUnit(UUID tenantId) {
        List<Unit> units = unitRepository.findAllByTenant_Id(tenantId);

        if (units.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Nenhuma unidade encontrada para este tenant"
            );
        }

        return units.get(0);
    }

    private UnitResponse toResponse(Unit unit) {
        return new UnitResponse(
                unit.getId(),
                unit.getName(),
                unit.getDocument(),
                unit.getEmail(),
                unit.getPhone(),
                unit.getStreet(),
                unit.getNumber(),
                unit.getComplement(),
                unit.getDistrict(),
                unit.getCity(),
                unit.getState(),
                unit.getCountry(),
                unit.getTimeZone(),
                unit.isActive(),
                unit.getVersion()
        );
    }
}
