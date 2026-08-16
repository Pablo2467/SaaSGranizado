package com.granizadoexpress.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PedidoResponse(
        UUID id,
        String nombreCliente,
        BigDecimal total,
        String estado,
        String canal,
        String notas,
        LocalDateTime createdAt,
        List<DetalleResponse> detalles
) {
    public record DetalleResponse(
            UUID productoId,
            String productoNombre,
            Integer cantidad,
            BigDecimal precioUnitario,
            BigDecimal subtotal
    ) {}
}
