package com.backend.barbers;

import com.backend.barbers.dto.BarberResponse;
import com.backend.barbers.dto.CreateBarberRequest;
import com.backend.barbers.dto.UpdateBarberRequest;
import com.backend.barbershops.Barbershop;
import com.backend.barbershops.BarbershopRepository;
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
    private final BarbershopRepository barbershopRepository;

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

        Barbershop barbershop = barbershopRepository
                .findById(request.barbershopId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Barbearia não encontrada"
                ));

        BarberProfile barber = new BarberProfile();

        barber.setUser(user);
        barber.setBarbershop(barbershop);
        barber.setDisplayName(request.displayName());
        barber.setBio(request.bio());
        barber.setDefaultCommissionPercent(
                request.defaultCommissionPercent()
        );
        barber.setStatus(BarberStatus.ACTIVE);

        BarberProfile savedBarber = barberRepository.save(barber);

        return toResponse(savedBarber);
    }

    public List<BarberResponse> listByBarbershop(UUID barbershopId) {

        if (!barbershopRepository.existsById(barbershopId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Barbearia não encontrada"
            );
        }

        return barberRepository
                .findAllByBarbershop_Id(barbershopId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public BarberResponse findById(UUID barberId) {
        return toResponse(findEntityById(barberId));
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
                barber.getBarbershop().getId(),
                barber.getDisplayName(),
                barber.getBio(),
                barber.getDefaultCommissionPercent(),
                barber.getStatus(),
                barber.getCreateAt(),
                barber.getUpdatedAt()
        );
    }
}