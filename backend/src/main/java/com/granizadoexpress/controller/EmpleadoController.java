package com.granizadoexpress.controller;

import com.granizadoexpress.dto.EmpleadoRequest;
import com.granizadoexpress.dto.EmpleadoResponse;
import com.granizadoexpress.dto.EmpleadoUpdateRequest;
import com.granizadoexpress.service.EmpleadoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/empleados")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DUENO')")
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    @PostMapping
    public ResponseEntity<EmpleadoResponse> crear(@Valid @RequestBody EmpleadoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(empleadoService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<EmpleadoResponse>> listar() {
        return ResponseEntity.ok(empleadoService.listar());
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpleadoResponse> actualizar(@PathVariable UUID id, @Valid @RequestBody EmpleadoUpdateRequest request) {
        return ResponseEntity.ok(empleadoService.actualizar(id, request));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<EmpleadoResponse> cambiarEstado(@PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
        boolean activo = Boolean.TRUE.equals(body.get("activo"));
        return ResponseEntity.ok(empleadoService.cambiarEstado(id, activo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        empleadoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}