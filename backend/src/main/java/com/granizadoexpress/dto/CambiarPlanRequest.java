package com.granizadoexpress.dto;

import jakarta.validation.constraints.NotBlank;

public record CambiarPlanRequest(
        @NotBlank(message = "El plan es obligatorio") String plan
) {
}
