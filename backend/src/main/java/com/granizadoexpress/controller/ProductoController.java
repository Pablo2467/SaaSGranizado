package com.granizadoexpress.controller;


import com.granizadoexpress.dto.ProductoRequest;
import com.granizadoexpress.dto.ProductoResponse;
import com.granizadoexpress.entity.Producto;
import com.granizadoexpress.repository.ProductoRepository;
import com.granizadoexpress.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/productos")
@RequiredArgsConstructor

public class ProductoController {
    private final ProductoService productoService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DUENO', 'ENCARGADO_PRODUCCION')")
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<ProductoResponse>> listar() {
        return ResponseEntity.ok(productoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(productoService.obtener(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DUENO', 'ENCARGADO_PRODUCCION')")
    public ResponseEntity<ProductoResponse> actualizar(@PathVariable UUID id, @Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.ok(productoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DUENO', 'ENCARGADO_PRODUCCION')")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
