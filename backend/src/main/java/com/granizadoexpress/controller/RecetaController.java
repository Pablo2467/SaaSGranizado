package com.granizadoexpress.controller;

import com.granizadoexpress.dto.RecetaRequest;
import com.granizadoexpress.dto.RecetaResponse;
import com.granizadoexpress.service.RecetaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/productos/{productoId}/recetas")
@RequiredArgsConstructor
public class RecetaController {

    private final RecetaService recetaService;

    @GetMapping
    public ResponseEntity<List<RecetaResponse>> listar(@PathVariable UUID productoId) {
        return ResponseEntity.ok(recetaService.listar(productoId));
    }

    @PostMapping
    public ResponseEntity<RecetaResponse> agregar(@PathVariable UUID productoId, @Valid @RequestBody RecetaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recetaService.agregar(productoId, request));
    }

    @PutMapping("/{recetaId}")
    public ResponseEntity<RecetaResponse> actualizar(
            @PathVariable UUID productoId,
            @PathVariable UUID recetaId,
            @Valid @RequestBody RecetaRequest request
    ) {
        return ResponseEntity.ok(recetaService.actualizar(productoId, recetaId, request));
    }

    @DeleteMapping("/{recetaId}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID productoId, @PathVariable UUID recetaId) {
        recetaService.eliminar(productoId, recetaId);
        return ResponseEntity.noContent().build();
    }
}