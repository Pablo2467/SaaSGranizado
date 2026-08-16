package com.granizadoexpress.controller;

import com.granizadoexpress.dto.SuscripcionResponse;
import com.granizadoexpress.service.SuscripcionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/suscripcion")
@RequiredArgsConstructor
public class SuscripcionController {

    private final SuscripcionService suscripcionService;

    @GetMapping("/estado")
    public ResponseEntity<SuscripcionResponse> estado() {
        return ResponseEntity.ok(suscripcionService.obtenerEstado());
    }
}