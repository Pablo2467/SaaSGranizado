package com.granizadoexpress.dto;

import java.math.BigDecimal;

public record PuntoGananciaResponse(
        String etiqueta,
        BigDecimal total,
        long pedidos
) {}
