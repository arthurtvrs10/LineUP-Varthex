package com.backend.barbers;

import com.backend.barbers.dto.BarberResponse;
import com.backend.barbers.dto.CreateBarberRequest;
import com.backend.barbers.dto.UpdateBarberRequest;
import com.backend.units.Unit;
import com.backend.units.UnitRepository;
import com.backend.users.User;
import com.backend.users.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BarberService {

    private final BarberRepository barberRepository;
    private final UserRepository userRepository;
    private final UnitRepository unitRepository;

    @Transactional
    public BarberResponse createBarber(CreateBarberRequest request) {

        validateDisplayName(request.displayName());
        validateCommission(request.defaultCommissionPercent());

        if (barberRepository.existsByUser_Id(request.userId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Esse usuário já possui um perfil de barbeiro"
            );
        }

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado"
                ));

        Unit unit = unitRepository
                .findById(request.unitId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Unidade não encontrada"
                ));

        BarberProfile barber = new BarberProfile();

        barber.setUser(user);
        barber.setUnit(unit);
        barber.setDisplayName(request.displayName());
        barber.setBio(request.bio());
        barber.setDefaultCommissionPercent(
                request.defaultCommissionPercent()
        );
        barber.setStatus(BarberStatus.ACTIVE);

        BarberProfile savedBarber = barberRepository.save(barber);

        return toResponse(savedBarber);
    }

    public List<BarberResponse> listByUnit(UUID unitId) {

        if (!unitRepository.existsById(unitId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Unidade não encontrada"
            );
        }

        return barberRepository
                .findAllByUnit_Id(unitId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Usado quando quem pergunta (ex.: CLIENT montando a tela de
    // agendamento) não tem como saber o unitId de antemão — Customer não
    // tem unidade própria, só tenant. Lista todos os barbeiros do tenant,
    // de qualquer unidade.
    public List<BarberResponse> listByTenant(UUID tenantId) {
        return barberRepository
                .findAllByUnit_Tenant_Id(tenantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public BarberResponse findById(UUID barberId) {
        return toResponse(findEntityById(barberId));
    }

    public BarberResponse findByUserId(UUID userId) {
        return barberRepository.findByUser_Id(userId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Este usuário não tem um perfil de barbeiro"
                ));
    }

    @Transactional
    public BarberResponse updateBarber(
            UUID barberId,
            UpdateBarberRequest request
    ) {
        BarberProfile barber = findEntityById(barberId);

        boolean hasChanges = false;

        if (request.displayName() != null) {
            validateDisplayName(request.displayName());
            barber.setDisplayName(request.displayName());
            hasChanges = true;
        }

        if (request.bio() != null) {
            barber.setBio(request.bio());
            hasChanges = true;
        }

        if (request.defaultCommissionPercent() != null) {
            validateCommission(request.defaultCommissionPercent());

            barber.setDefaultCommissionPercent(
                    request.defaultCommissionPercent()
            );

            hasChanges = true;
        }

        if (!hasChanges) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe pelo menos um campo para atualizar"
            );
        }

        return toResponse(barberRepository.save(barber));
    }

    @Transactional
    public BarberResponse changeStatus(
            UUID barberId,
            BarberStatus status
    ) {
        if (status == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O status é obrigatório"
            );
        }

        BarberProfile barber = findEntityById(barberId);
        barber.setStatus(status);

        return toResponse(barberRepository.save(barber));
    }

    private BarberProfile findEntityById(UUID barberId) {
        return barberRepository.findById(barberId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Barbeiro não encontrado"
                ));
    }

    private void validateCommission(Integer commissionPercent) {

        if (commissionPercent == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A comissão é obrigatória"
            );
        }

        if (commissionPercent < 0 || commissionPercent > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A comissão deve estar entre 0 e 100"
            );
        }
    }

    private void validateDisplayName(String displayName) {

        if (displayName == null || displayName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O nome de exibição é obrigatório"
            );
        }
    }

    private BarberResponse toResponse(BarberProfile barber) {
        return new BarberResponse(
                barber.getId(),
                barber.getUser().getId(),
                barber.getUnit().getId(),
                barber.getDisplayName(),
                barber.getBio(),
                barber.getDefaultCommissionPercent(),
                barber.getStatus(),
                barber.getCreateAt(),
                barber.getUpdatedAt()
        );
    }
}
