package com.granizadoexpress.service;

import com.granizadoexpress.dto.SuscripcionResponse;
import com.granizadoexpress.entity.Suscripcion;
import com.granizadoexpress.repository.SuscripcionRepository;
import com.granizadoexpress.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
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

    // Precio mensual sugerido por plan (COP). Ajusta estos valores a tu negocio real.
    private static final Map<Suscripcion.PlanSuscripcion, BigDecimal> PRECIO_PLAN = Map.of(
            Suscripcion.PlanSuscripcion.TRIAL, BigDecimal.ZERO,
            Suscripcion.PlanSuscripcion.BASICO, new BigDecimal("39900"),
            Suscripcion.PlanSuscripcion.PRO, new BigDecimal("79900")
    );

    private static final int DIAS_CICLO_FACTURACION = 30;

    public SuscripcionResponse obtenerEstado() {
        // OJO: aquí NO se filtra por estado = ACTIVA. Este endpoint está exento
        // del SuscripcionFilter justamente para que el dueño SIEMPRE pueda ver
        // en qué quedó su plan (incluida una suscripción VENCIDA, CANCELADA o
        // PAUSADA). Si filtrábamos por ACTIVA, el endpoint se rompía apenas el
        // trial vencía: estaVencida() la marca VENCIDA en segundo plano en
        // cualquier otra petición, y esta consulta dejaba de encontrar nada.
        Suscripcion suscripcion = obtenerSuscripcionDeMiEmpresa();
        return construirRespuesta(suscripcion);
    }

    public void verificarLimiteProductos(int cantidadActual) {
        Suscripcion suscripcion = obtenerSuscripcionDeMiEmpresa();
        int limite = LIMITE_PRODUCTOS.get(suscripcion.getPlan());

        if (cantidadActual >= limite) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Alcanzaste el límite de " + limite + " productos de tu plan " + suscripcion.getPlan() +
                            ". Mejora tu plan para agregar más.");
        }
    }

    /**
     * Activa o cambia el plan de la empresa. Reservado al Dueño (ver
     * @PreAuthorize en el controller). Si la suscripción estaba
     * CANCELADA o PAUSADA, este mismo método la reactiva.
     */
    public SuscripcionResponse cambiarPlan(String planTexto) {
        Suscripcion.PlanSuscripcion plan = parsearPlan(planTexto);
        Suscripcion suscripcion = obtenerSuscripcionDeMiEmpresa();

        suscripcion.setPlan(plan);
        suscripcion.setEsTrial(plan == Suscripcion.PlanSuscripcion.TRIAL);
        suscripcion.setMontoMensual(PRECIO_PLAN.get(plan));
        suscripcion.setEstado(Suscripcion.EstadoSuscripcion.ACTIVA);
        suscripcion.setFechaVencimiento(LocalDate.now().plusDays(DIAS_CICLO_FACTURACION));
        suscripcionRepository.save(suscripcion);

        return construirRespuesta(suscripcion);
    }

    /** Desactiva el plan (bloquea el acceso operativo salvo /suscripcion). Reservado al Dueño. */
    public SuscripcionResponse cancelar() {
        Suscripcion suscripcion = obtenerSuscripcionDeMiEmpresa();
        suscripcion.setEstado(Suscripcion.EstadoSuscripcion.CANCELADA);
        suscripcionRepository.save(suscripcion);
        return construirRespuesta(suscripcion);
    }

    /** Reactiva una suscripción cancelada o pausada, sin cambiar el plan. Reservado al Dueño. */
    public SuscripcionResponse reactivar() {
        Suscripcion suscripcion = obtenerSuscripcionDeMiEmpresa();
        suscripcion.setEstado(Suscripcion.EstadoSuscripcion.ACTIVA);
        if (suscripcion.getFechaVencimiento().isBefore(LocalDate.now())) {
            suscripcion.setFechaVencimiento(LocalDate.now().plusDays(DIAS_CICLO_FACTURACION));
        }
        suscripcionRepository.save(suscripcion);
        return construirRespuesta(suscripcion);
    }

    private Suscripcion.PlanSuscripcion parsearPlan(String plan) {
        try {
            return Suscripcion.PlanSuscripcion.valueOf(plan);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Plan inválido: " + plan);
        }
    }

    // La búsqueda normal (findByEmpresaIdAndEstado ACTIVA) no sirve aquí porque
    // el dueño debe poder actuar también sobre una suscripción CANCELADA/PAUSADA
    // para reactivarla, así que buscamos la más reciente de la empresa sin filtrar estado.
    private Suscripcion obtenerSuscripcionDeMiEmpresa() {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        return suscripcionRepository.findTopByEmpresaIdOrderByCreatedAtDesc(empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró una suscripción"));
    }

    private SuscripcionResponse construirRespuesta(Suscripcion suscripcion) {
        long diasRestantes = ChronoUnit.DAYS.between(LocalDate.now(), suscripcion.getFechaVencimiento());
        return new SuscripcionResponse(
                suscripcion.getPlan().name(),
                suscripcion.getEstado().name(),
                suscripcion.getFechaVencimiento(),
                suscripcion.getEsTrial(),
                Math.max(diasRestantes, 0)
        );
    }

    public boolean estaVencida(UUID empresaId) {
        Suscripcion suscripcion = suscripcionRepository
                .findByEmpresaIdAndEstado(empresaId, Suscripcion.EstadoSuscripcion.ACTIVA)
                .orElse(null);

        if (suscripcion == null) {
            return true; 
        }

        boolean vencida = suscripcion.getFechaVencimiento().isBefore(LocalDate.now());
        if (vencida) {
            suscripcion.setEstado(Suscripcion.EstadoSuscripcion.VENCIDA);
            suscripcionRepository.save(suscripcion);
        }
        return vencida;
    }
}