package com.backend.barbers.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateBarberRequest(

        @NotNull(message = "O usuário é obrigatório")
        UUID userId,

        @NotNull(message = "A unidade é obrigatória")
        UUID unitId,

        @NotBlank(message = "O nome de exibição é obrigatório")
        @Size(
                max = 150,
                message = "O nome deve ter no máximo 150 caracteres"
        )
        String displayName,

        @Size(
                max = 1000,
                message = "A bio deve ter no máximo 1000 caracteres"
        )
        String bio,

        @NotNull(message = "A comissão é obrigatória")
        @Min(value = 0, message = "A comissão mínima é 0")
        @Max(value = 100, message = "A comissão máxima é 100")
        Integer defaultCommissionPercent
) {
}