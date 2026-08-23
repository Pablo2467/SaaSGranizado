package com.granizadoexpress.service;

import com.granizadoexpress.dto.EmpleadoRequest;
import com.granizadoexpress.dto.EmpleadoResponse;
import com.granizadoexpress.dto.EmpleadoUpdateRequest;
import com.granizadoexpress.entity.Empresa;
import com.granizadoexpress.entity.Usuario;
import com.granizadoexpress.entity.UsuarioSabor;
import com.granizadoexpress.repository.EmpresaRepository;
import com.granizadoexpress.repository.UsuarioRepository;
import com.granizadoexpress.repository.UsuarioSaborRepository;
import com.granizadoexpress.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * Gestión de empleados de la empresa: crear, editar rol, asignar sabores
 * (solo aplica a OPERADOR_MAQUINA), activar/desactivar y eliminar.
 * Todo este servicio está reservado al rol DUENO (ver @PreAuthorize en el controller).
 */
@Service
@RequiredArgsConstructor
public class EmpleadoService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioSaborRepository usuarioSaborRepository;
    private final EmpresaRepository empresaRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public EmpleadoResponse crear(EmpleadoRequest request) {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();

        if (usuarioRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario registrado con ese email");
        }

        Usuario.RolUsuario rol = parsearRol(request.rol());
        Empresa empresa = empresaRepository.getReferenceById(empresaId);

        Usuario usuario = Usuario.builder()
                .empresa(empresa)
                .nombre(request.nombre())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .rol(rol)
                .activo(true)
                .build();
        usuario = usuarioRepository.save(usuario);

        guardarSabores(usuario, rol, request.sabores());

        return mapearResponse(usuario);
    }

    public List<EmpleadoResponse> listar() {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        return usuarioRepository.findByEmpresaIdAndDeletedAtIsNullOrderByNombreAsc(empresaId)
                .stream()
                .map(this::mapearResponse)
                .toList();
    }

    @Transactional
    public EmpleadoResponse actualizar(UUID id, EmpleadoUpdateRequest request) {
        Usuario usuario = obtenerDeMiEmpresa(id);
        Usuario.RolUsuario rol = parsearRol(request.rol());

        if (usuario.getRol() == Usuario.RolUsuario.DUENO && rol != Usuario.RolUsuario.DUENO) {
            verificarNoEsUltimoDueno(usuario);
        }

        usuario.setNombre(request.nombre());
        usuario.setRol(rol);
        usuarioRepository.save(usuario);

        usuarioSaborRepository.deleteByUsuarioId(usuario.getId());
        guardarSabores(usuario, rol, request.sabores());

        return mapearResponse(usuario);
    }

    @Transactional
    public EmpleadoResponse cambiarEstado(UUID id, boolean activo) {
        Usuario usuario = obtenerDeMiEmpresa(id);

        if (usuario.getId().equals(SecurityUtils.obtenerUsuarioActual().getUsuarioId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes desactivar tu propia cuenta");
        }
        if (!activo && usuario.getRol() == Usuario.RolUsuario.DUENO) {
            verificarNoEsUltimoDueno(usuario);
        }

        usuario.setActivo(activo);
        usuarioRepository.save(usuario);
        return mapearResponse(usuario);
    }

    @Transactional
    public void eliminar(UUID id) {
        Usuario usuario = obtenerDeMiEmpresa(id);

        if (usuario.getId().equals(SecurityUtils.obtenerUsuarioActual().getUsuarioId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes eliminar tu propia cuenta");
        }
        if (usuario.getRol() == Usuario.RolUsuario.DUENO) {
            verificarNoEsUltimoDueno(usuario);
        }

        usuario.setDeletedAt(java.time.LocalDateTime.now());
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    private void verificarNoEsUltimoDueno(Usuario usuario) {
        UUID empresaId = usuario.getEmpresa().getId();
        long duenosActivos = usuarioRepository.findByEmpresaIdAndDeletedAtIsNullOrderByNombreAsc(empresaId).stream()
                .filter(u -> u.getRol() == Usuario.RolUsuario.DUENO && u.getActivo())
                .count();
        if (duenosActivos <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Debe existir al menos un Dueño activo en la empresa");
        }
    }

    private void guardarSabores(Usuario usuario, Usuario.RolUsuario rol, List<String> sabores) {
        if (rol != Usuario.RolUsuario.OPERADOR_MAQUINA || sabores == null) {
            return;
        }
        for (String sabor : sabores) {
            if (sabor == null || sabor.isBlank()) continue;
            usuarioSaborRepository.save(
                    UsuarioSabor.builder().usuario(usuario).sabor(sabor.trim()).build()
            );
        }
    }

    private Usuario obtenerDeMiEmpresa(UUID id) {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        return usuarioRepository.findByIdAndEmpresaIdAndDeletedAtIsNull(id, empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empleado no encontrado"));
    }

    private Usuario.RolUsuario parsearRol(String rol) {
        try {
            return Usuario.RolUsuario.valueOf(rol);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol inválido: " + rol);
        }
    }

    private EmpleadoResponse mapearResponse(Usuario usuario) {
        List<String> sabores = usuarioSaborRepository.findByUsuarioId(usuario.getId())
                .stream().map(UsuarioSabor::getSabor).toList();

        return new EmpleadoResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().name(),
                usuario.getActivo(),
                sabores,
                usuario.getCreatedAt()
        );
    }
}