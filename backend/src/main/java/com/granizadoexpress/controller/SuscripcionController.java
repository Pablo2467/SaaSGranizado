package com.granizadoexpress.controller;

import com.granizadoexpress.dto.CambiarPlanRequest;
import com.granizadoexpress.dto.SuscripcionResponse;
import com.granizadoexpress.service.SuscripcionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/suscripcion")
@RequiredArgsConstructor
public class SuscripcionController {

    private final SuscripcionService suscripcionService;

    @GetMapping("/estado")
    public ResponseEntity<SuscripcionResponse> estado() {
        return ResponseEntity.ok(suscripcionService.obtenerEstado());
    }

    // Activar / cambiar de plan. Solo el Dueño decide esto.
    @PostMapping("/cambiar-plan")
    @PreAuthorize("hasRole('DUENO')")
    public ResponseEntity<SuscripcionResponse> cambiarPlan(@Valid @RequestBody CambiarPlanRequest request) {
        return ResponseEntity.ok(suscripcionService.cambiarPlan(request.plan()));
    }

    // Desactivar el plan actual. Solo el Dueño.
    @PostMapping("/cancelar")
    @PreAuthorize("hasRole('DUENO')")
    public ResponseEntity<SuscripcionResponse> cancelar() {
        return ResponseEntity.ok(suscripcionService.cancelar());
    }

    // Reactivar un plan cancelado o pausado. Solo el Dueño.
    @PostMapping("/reactivar")
    @PreAuthorize("hasRole('DUENO')")
    public ResponseEntity<SuscripcionResponse> reactivar() {
        return ResponseEntity.ok(suscripcionService.reactivar());
    }
}