package com.granizadoexpress.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductoResponse(
        UUID id,
        String nombre,
        String descripcion,
        BigDecimal precio,
        String categoria,
        String imagenUrl,
        Boolean disponible
) {}