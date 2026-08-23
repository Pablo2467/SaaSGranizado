package com.granizadoexpress.repository;

import com.granizadoexpress.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    Optional<Usuario> findByEmailAndDeletedAtIsNull(String email);
    boolean existsByEmail(String email);

    Optional<Usuario> findByEmailAndEmpresaIdAndDeletedAtIsNull(String email, UUID empresaId);

    List<Usuario> findByEmpresaIdAndDeletedAtIsNullOrderByNombreAsc(UUID empresaId);

    Optional<Usuario> findByIdAndEmpresaIdAndDeletedAtIsNull(UUID id, UUID empresaId);

    long countByEmpresaIdAndDeletedAtIsNull(UUID empresaId);
}