package com.granizadoexpress.repository;

import com.granizadoexpress.entity.UsuarioSabor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UsuarioSaborRepository extends JpaRepository<UsuarioSabor, UUID> {

    List<UsuarioSabor> findByUsuarioId(UUID usuarioId);

    void deleteByUsuarioId(UUID usuarioId);
}
