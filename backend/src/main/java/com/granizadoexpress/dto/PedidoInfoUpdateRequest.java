package com.granizadoexpress.dto;

public record PedidoInfoUpdateRequest(
        String nombreCliente,
        String canal, // "WHATSAPP", "PRESENCIAL" o "WEB"
        String notas
) {}