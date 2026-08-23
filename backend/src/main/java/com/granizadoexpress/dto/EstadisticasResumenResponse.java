package com.granizadoexpress.dto;

import java.math.BigDecimal;

public record EstadisticasResumenResponse(
        PeriodoResumen hoy,
        PeriodoResumen semana,
        PeriodoResumen mes,
        PeriodoResumen anio
) {
    public record PeriodoResumen(
            BigDecimal total,
            long pedidos,
            BigDecimal ticketPromedio
    ) {}
}