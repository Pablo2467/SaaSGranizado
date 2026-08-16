package com.granizadoexpress.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record RecetaRequest(
        @NotNull(message = "El insumo es obligatorio")
        UUID insumoId,

        @NotNull(message = "La cantidad requerida es obligatoria")
        @DecimalMin(value = "0.0", inclusive = false, message = "La cantidad debe ser mayor a 0")
        BigDecimal cantidadRequerida
) {}