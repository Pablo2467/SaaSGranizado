package com.granizadoexpress.repository;

import com.granizadoexpress.entity.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, UUID> {
    Optional<Empresa> findBySlugAndDeletedAtIsNull(String slug);

    boolean existsBySlug(String slug);

}
