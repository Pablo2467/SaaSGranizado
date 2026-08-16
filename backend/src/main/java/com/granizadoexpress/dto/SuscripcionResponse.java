package com.granizadoexpress.dto;

import java.time.LocalDate;

public record SuscripcionResponse(
        String plan,
        String estado,
        LocalDate fechaVencimiento,
        Boolean esTrial,
        Long diasRestantes
) {}
