package com.granizadoexpress.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record PedidoRequest(
        String nombreCliente,

        String canal, // "WHATSAPP", "PRESENCIAL" o "WEB"

        String notas,

        @NotEmpty(message = "El pedido debe tener al menos un producto")
        @Valid
        List<DetalleRequest> detalles
) {
    public record DetalleRequest(
            @NotNull(message = "El producto es obligatorio")
            UUID productoId,

            @NotNull(message = "La cantidad es obligatoria")
            @Min(value = 1, message = "La cantidad debe ser al menos 1")
            Integer cantidad
    ) {}
}