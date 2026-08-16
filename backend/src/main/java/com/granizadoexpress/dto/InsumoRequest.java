package com.granizadoexpress.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record InsumoRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotBlank(message = "La unidad de medida es obligatoria")
        String unidadMedida,

        @NotNull(message = "La cantidad actual es obligatoria")
        @DecimalMin(value = "0.0", message = "La cantidad no puede ser negativa")
        BigDecimal cantidadActual,

        @NotNull(message = "El stock mínimo es obligatorio")
        @DecimalMin(value = "0.0", message = "El stock mínimo no puede ser negativo")
        BigDecimal stockMinimo,

        @NotNull(message = "El costo unitario es obligatorio")
        @DecimalMin(value = "0.0", message = "El costo no puede ser negativo")
        BigDecimal costoUnitario
) {}