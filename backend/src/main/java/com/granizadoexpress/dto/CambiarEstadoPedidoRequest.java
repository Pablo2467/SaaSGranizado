package com.granizadoexpress.dto;

import jakarta.validation.constraints.NotBlank;

public record CambiarEstadoPedidoRequest(
        @NotBlank(message = "El estado es obligatorio")
        String estado // "PENDIENTE", "CONFIRMADO", "EN_PREPARACION", "ENTREGADO" o "CANCELADO"
) {}