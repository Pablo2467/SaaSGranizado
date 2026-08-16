package com.granizadoexpress.service;

import com.granizadoexpress.dto.AuthResponse;
import com.granizadoexpress.dto.LoginRequest;
import com.granizadoexpress.dto.RegistroRequest;
import com.granizadoexpress.dto.UsuarioResponse;
import com.granizadoexpress.entity.Empresa;
import com.granizadoexpress.entity.Suscripcion;
import com.granizadoexpress.entity.Usuario;
import com.granizadoexpress.repository.EmpresaRepository;
import com.granizadoexpress.repository.SuscripcionRepository;
import com.granizadoexpress.repository.UsuarioRepository;
import com.granizadoexpress.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

/**
 * Lógica de negocio de autenticación. El controlador solo va a
 * recibir el request y delegar aquí — toda la decisión real
 * (qué crear, en qué orden, qué validar) vive en este servicio.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final SuscripcionRepository suscripcionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    // Duración del periodo de prueba gratuito para toda empresa nueva.
    private static final int DIAS_TRIAL = 14;

    /**
     * Registra una empresa nueva junto con su primer usuario (OWNER)
     * y una suscripción en modo TRIAL. Las tres cosas se crean juntas
     * o ninguna se crea: @Transactional revierte todo si algo falla
     * a mitad de camino (por ejemplo, si el guardado del usuario
     * fallara después de haber guardado la empresa).
     */
    @Transactional
    public AuthResponse registrar(RegistroRequest request) {

        if (empresaRepository.existsBySlug(request.slug())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una empresa con ese slug");
        }
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario registrado con ese email");
        }

        Empresa empresa = Empresa.builder()
                .nombre(request.nombreEmpresa())
                .slug(request.slug())
                .whatsapp(request.whatsapp())
                .build();
        empresa = empresaRepository.save(empresa);

        Suscripcion suscripcion = Suscripcion.builder()
                .empresa(empresa)
                .fechaVencimiento(LocalDate.now().plusDays(DIAS_TRIAL))
                .build();
        suscripcionRepository.save(suscripcion);

        // OWNER está fijo aquí, nunca viene del request: es la única
        // forma de asegurarnos de que nadie se auto-asigne otro rol.
        Usuario usuario = Usuario.builder()
                .empresa(empresa)
                .nombre(request.nombreUsuario())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .rol(Usuario.RolUsuario.OWNER)
                .build();
        usuario = usuarioRepository.save(usuario);

        String token = jwtService.generarToken(usuario.getEmail(), empresa.getId(), usuario.getRol().name());

        return construirRespuesta(token, empresa, usuario);
    }

    /**
     * Valida email + password. Delegamos la verificación al
     * AuthenticationManager de Spring, que internamente usa
     * UserDetailsServiceImpl (para cargar el usuario) y el
     * PasswordEncoder (para comparar el hash) — ya configurados
     * en SecurityConfig. No comparamos contraseñas a mano aquí.
     */
    public AuthResponse login(LoginRequest request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos");
        }

        Usuario usuario = usuarioRepository.findByEmailAndDeletedAtIsNull(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos"));

        String token = jwtService.generarToken(usuario.getEmail(), usuario.getEmpresa().getId(), usuario.getRol().name());

        return construirRespuesta(token, usuario.getEmpresa(), usuario);
    }

    private AuthResponse construirRespuesta(String token, Empresa empresa, Usuario usuario) {
        return new AuthResponse(
                token,
                empresa.getId(),
                empresa.getNombre(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().name()
        );
    }
    public UsuarioResponse obtenerUsuarioActual(String email) {
        Usuario usuario = usuarioRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().name(),
                usuario.getEmpresa().getId(),
                usuario.getEmpresa().getNombre()
        );
    }
}
