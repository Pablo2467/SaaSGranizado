package com.granizadoexpress.controller;

import com.granizadoexpress.dto.InsumoRequest;
import com.granizadoexpress.dto.InsumoResponse;
import com.granizadoexpress.service.InsumoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/insumos")
@RequiredArgsConstructor
public class InsumoController {

    private final InsumoService insumoService;

    @PostMapping
    public ResponseEntity<InsumoResponse> crear(@Valid @RequestBody InsumoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(insumoService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<InsumoResponse>> listar() {
        return ResponseEntity.ok(insumoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsumoResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(insumoService.obtener(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsumoResponse> actualizar(@PathVariable UUID id, @Valid @RequestBody InsumoRequest request) {
        return ResponseEntity.ok(insumoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        insumoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}