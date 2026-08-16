package com.granizadoexpress.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistroRequest(

        @NotBlank(message = "El nombre de la empresa es obligatorio")
        @Size(max = 200, message = "El nombre no puede superar 200 caracteres")
        String nombreEmpresa,

        @NotBlank(message = "El slug es obligatorio")
        @Size(max = 100, message = "El slug no puede superar 100 caracteres")
        String slug,

        @NotBlank(message = "El WhatsApp es obligatorio")
        @Size(max = 20)
        String whatsapp,

        @NotBlank(message = "El nombre del usuario es obligatorio")
        @Size(max = 200)
        String nombreUsuario,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, message = "La contraseña debe tener mínimo 8 caracteres")
        String password
) {}
