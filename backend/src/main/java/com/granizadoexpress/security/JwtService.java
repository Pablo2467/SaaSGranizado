package com.granizadoexpress.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    // Se conecta con la aplicacion properties
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration.ms}")
    private long jwtExpirationMs;

    /**
     * Convierte el string plano de application.properties en una
     * SecretKey utilizable por la librería jjwt para firmar/verificar.
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());

    }
    /** Se genera el token para el usuario ya autenticado entonces
     * dentro del token se guarda la empresaId y rol para que el
     * filtro y los controladores los usen en cada REQUEST
     */
    public String generarToken(String email, UUID empresaId, String rol) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("empresaId", empresaId.toString());
        claims.put("rol", rol);

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extrae el email (subject) del token. Es lo que usamos para
     * saber "quién dice ser" el que hace la petición.
     */
    public String extraerEmail(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    public UUID extraerEmpresaId(String token) {
        String empresaId = extraerClaim(token, claims -> claims.get("empresaId", String.class));
        return UUID.fromString(empresaId);
    }

    public String extraerRol(String token) {
        return extraerClaim(token, claims -> claims.get("rol", String.class));
    }

    /**
     * Valida que el token pertenezca al usuario indicado y que no
     * haya expirado. Se llama desde JwtFilter en cada request.
     */
    public boolean esTokenValido(String token, UserDetails userDetails) {
        final String email = extraerEmail(token);
        return email.equals(userDetails.getUsername()) && !estaExpirado(token);
    }

    private boolean estaExpirado(String token) {
        return extraerFechaExpiracion(token).before(new Date());
    }

    private Date extraerFechaExpiracion(String token) {
        return extraerClaim(token, Claims::getExpiration);
    }

    private <T> T extraerClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extraerTodosLosClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extraerTodosLosClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
