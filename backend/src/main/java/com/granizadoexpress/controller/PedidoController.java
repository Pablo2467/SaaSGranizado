package com.granizadoexpress.controller;

import com.granizadoexpress.dto.CambiarEstadoPedidoRequest;
import com.granizadoexpress.dto.PedidoInfoUpdateRequest;
import com.granizadoexpress.dto.PedidoRequest;
import com.granizadoexpress.dto.PedidoResponse;
import com.granizadoexpress.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DUENO', 'CAJERO')")
    public ResponseEntity<PedidoResponse> crear(@Valid @RequestBody PedidoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listar() {
        return ResponseEntity.ok(pedidoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(pedidoService.obtener(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DUENO', 'CAJERO')")
    public ResponseEntity<PedidoResponse> actualizar(@PathVariable UUID id, @RequestBody PedidoInfoUpdateRequest request) {
        return ResponseEntity.ok(pedidoService.actualizarInfo(id, request));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('DUENO', 'CAJERO')")
    public ResponseEntity<PedidoResponse> cambiarEstado(@PathVariable UUID id, @Valid @RequestBody CambiarEstadoPedidoRequest request) {
        return ResponseEntity.ok(pedidoService.cambiarEstado(id, request.estado()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DUENO', 'CAJERO')")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        pedidoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}