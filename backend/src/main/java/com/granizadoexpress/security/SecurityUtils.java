package com.granizadoexpress.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

public class SecurityUtils {

    private SecurityUtils() {}

    public static UsuarioPrincipal obtenerUsuarioActual() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UsuarioPrincipal usuarioPrincipal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No hay usuario autenticado válido");
        }
        return usuarioPrincipal;
    }

    public static UUID obtenerEmpresaId() {
        return obtenerUsuarioActual().getEmpresaId();
    }
}
