package com.granizadoexpress.dto;

import java.util.UUID;

public record UsuarioResponse(
        UUID usuarioId,
        String nombre,
        String email,
        String rol,
        UUID empresaId,
        String empresaNombre
) {
}