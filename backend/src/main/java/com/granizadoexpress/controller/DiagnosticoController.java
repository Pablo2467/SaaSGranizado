package com.granizadoexpress.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DiagnosticoController {

    @Value("${app.cors.allowed-origins}")
    private String corsOrigins;

    @GetMapping("/diagnostico")
    public String diagnostico() {
        return "CORS_ALLOWED_ORIGINS cargado como: [" + corsOrigins + "] (longitud: " + corsOrigins.length() + " caracteres)";
    }
}