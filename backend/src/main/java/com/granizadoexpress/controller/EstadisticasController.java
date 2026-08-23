package com.granizadoexpress.controller;

import com.granizadoexpress.dto.EstadisticasResumenResponse;
import com.granizadoexpress.dto.ProductoVendidoResponse;
import com.granizadoexpress.dto.PuntoGananciaResponse;
import com.granizadoexpress.service.EstadisticasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/estadisticas/ganancias")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('DUENO', 'ENCARGADO_PRODUCCION')")
public class EstadisticasController {

    private final EstadisticasService estadisticasService;

    @GetMapping("/resumen")
    public ResponseEntity<EstadisticasResumenResponse> resumen() {
        return ResponseEntity.ok(estadisticasService.resumen());
    }

    @GetMapping("/serie")
    public ResponseEntity<List<PuntoGananciaResponse>> serie(
            @RequestParam String periodo,
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) Integer mes
    ) {
        return ResponseEntity.ok(estadisticasService.serie(periodo, anio, mes));
    }

    @GetMapping("/por-producto")
    public ResponseEntity<List<ProductoVendidoResponse>> porProducto(
            @RequestParam String periodo,
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) Integer mes
    ) {
        return ResponseEntity.ok(estadisticasService.porProducto(periodo, anio, mes));
    }
}