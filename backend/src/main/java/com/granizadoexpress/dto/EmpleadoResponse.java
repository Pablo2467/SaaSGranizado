package com.granizadoexpress.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record EmpleadoResponse(
        UUID id,
        String nombre,
        String email,
        String rol,
        Boolean activo,
        List<String> sabores,
        LocalDateTime createdAt
) {
}
