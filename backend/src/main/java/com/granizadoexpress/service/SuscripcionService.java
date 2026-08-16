package com.granizadoexpress.service;

import com.granizadoexpress.dto.SuscripcionResponse;
import com.granizadoexpress.entity.Suscripcion;
import com.granizadoexpress.repository.SuscripcionRepository;
import com.granizadoexpress.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SuscripcionService {

    private final SuscripcionRepository suscripcionRepository;

    // Límite de productos activos según el plan. PRO no tiene límite (Integer.MAX_VALUE).
    private static final Map<Suscripcion.PlanSuscripcion, Integer> LIMITE_PRODUCTOS = Map.of(
            Suscripcion.PlanSuscripcion.TRIAL, 5,
            Suscripcion.PlanSuscripcion.BASICO, 30,
            Suscripcion.PlanSuscripcion.PRO, Integer.MAX_VALUE
    );

    public SuscripcionResponse obtenerEstado() {
        Suscripcion suscripcion = obtenerSuscripcionActual();
        long diasRestantes = ChronoUnit.DAYS.between(LocalDate.now(), suscripcion.getFechaVencimiento());

        return new SuscripcionResponse(
                suscripcion.getPlan().name(),
                suscripcion.getEstado().name(),
                suscripcion.getFechaVencimiento(),
                suscripcion.getEsTrial(),
                Math.max(diasRestantes, 0)
        );
    }

    public void verificarLimiteProductos(int cantidadActual) {
        Suscripcion suscripcion = obtenerSuscripcionActual();
        int limite = LIMITE_PRODUCTOS.get(suscripcion.getPlan());

        if (cantidadActual >= limite) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Alcanzaste el límite de " + limite + " productos de tu plan " + suscripcion.getPlan() +
                            ". Mejora tu plan para agregar más.");
        }
    }

    public boolean estaVencida(UUID empresaId) {
        Suscripcion suscripcion = suscripcionRepository
                .findByEmpresaIdAndEstado(empresaId, Suscripcion.EstadoSuscripcion.ACTIVA)
                .orElse(null);

        if (suscripcion == null) {
            return true; // no tiene ninguna suscripción ACTIVA registrada
        }

        boolean vencida = suscripcion.getFechaVencimiento().isBefore(LocalDate.now());
        if (vencida) {
            suscripcion.setEstado(Suscripcion.EstadoSuscripcion.VENCIDA);
            suscripcionRepository.save(suscripcion);
        }
        return vencida;
    }

    private Suscripcion obtenerSuscripcionActual() {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        return suscripcionRepository.findByEmpresaIdAndEstado(empresaId, Suscripcion.EstadoSuscripcion.ACTIVA)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró una suscripción activa"));
    }
}
