package com.granizadoexpress.dto;

import java.util.UUID;

public record AuthResponse(
        String token,
        UUID empresaId,
        String empresaNombre,
        String usuarioNombre,
        String email,
        String rol
) {
}
