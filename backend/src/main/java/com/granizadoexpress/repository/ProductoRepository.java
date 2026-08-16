package com.granizadoexpress.repository;

import com.granizadoexpress.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, UUID> {

    //Catalogar de manera publica los productos activos y no
    List<Producto> findByEmpresaIdAndDisponibleTrueAndDeletedAtIsNull(UUID empresaId);

    List<Producto> findByEmpresaIdAndDeletedAtIsNull(UUID empresaId);

    Optional<Producto> findByIdAndEmpresaIdAndDeletedAtIsNull(UUID id, UUID empresaId);
}
