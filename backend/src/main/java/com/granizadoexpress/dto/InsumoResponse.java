package com.granizadoexpress.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record InsumoResponse(
        UUID id,
        String nombre,
        String unidadMedida,
        BigDecimal cantidadActual,
        BigDecimal stockMinimo,
        Boolean alertaStock,
        BigDecimal costoUnitario
) {}