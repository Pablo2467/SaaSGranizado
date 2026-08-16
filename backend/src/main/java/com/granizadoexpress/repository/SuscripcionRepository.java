package com.granizadoexpress.repository;

import com.granizadoexpress.entity.Suscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuscripcionRepository extends JpaRepository<Suscripcion, UUID> {

    // Busca la suscripción activa de una empresa
    Optional<Suscripcion> findByEmpresaIdAndEstado(
            UUID empresaId,
            Suscripcion.EstadoSuscripcion estado
    );
}