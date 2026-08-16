package com.granizadoexpress.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.granizadoexpress.service.SuscripcionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Corre después de JwtFilter (ya sabemos quién es el usuario). Si su
 * empresa tiene la suscripción vencida, corta la petición aquí mismo
 * con 402 — así ningún service nuevo que se agregue en el futuro
 * puede "olvidarse" de esta validación, porque no depende de que
 * alguien la escriba a mano en cada uno.
 */
@Component
@RequiredArgsConstructor
public class SuscripcionFilter extends OncePerRequestFilter {

    private final SuscripcionService suscripcionService;
    private final ObjectMapper objectMapper;

    // Rutas que deben funcionar SIEMPRE, incluso con la suscripción vencida.
    private static final String[] RUTAS_EXENTAS = {
            "/auth/", "/error", "/suscripcion/estado"
    };

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        boolean esRutaExenta = java.util.Arrays.stream(RUTAS_EXENTAS).anyMatch(path::startsWith);

        Object principal = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getPrincipal()
                : null;

        if (!esRutaExenta && principal instanceof UsuarioPrincipal usuarioPrincipal) {
            boolean vencida = suscripcionService.estaVencida(usuarioPrincipal.getEmpresaId());
            if (vencida) {
                response.setStatus(HttpStatus.PAYMENT_REQUIRED.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");

                Map<String, Object> body = new LinkedHashMap<>();
                body.put("timestamp", OffsetDateTime.now().toString());
                body.put("status", HttpStatus.PAYMENT_REQUIRED.value());
                body.put("error", "Payment Required");
                body.put("message", "Tu suscripción venció. Renueva tu plan para seguir operando.");

                response.getWriter().write(objectMapper.writeValueAsString(body));
                return; // corta aquí, no deja pasar la petición
            }
        }

        filterChain.doFilter(request, response);
    }
}