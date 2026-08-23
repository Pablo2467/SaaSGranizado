package com.granizadoexpress.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record EmpleadoRequest(
        @NotBlank(message = "El nombre es obligatorio") String nombre,
        @NotBlank(message = "El email es obligatorio") @Email(message = "Email inválido") String email,
        @NotBlank(message = "La contraseña es obligatoria") @Size(min = 6, message = "Mínimo 6 caracteres") String password,
        @NotNull(message = "El rol es obligatorio") String rol,
        List<String> sabores
) {
}