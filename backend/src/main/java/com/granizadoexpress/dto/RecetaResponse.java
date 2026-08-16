package com.granizadoexpress.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record RecetaResponse(
        UUID id,
        UUID insumoId,
        String insumoNombre,
        String unidadMedida,
        BigDecimal cantidadRequerida
) {}
