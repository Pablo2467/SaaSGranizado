package com.granizadoexpress.repository;

import com.granizadoexpress.entity.HistorialInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HistorialInventarioRepository extends JpaRepository<HistorialInventario, UUID> {

    // Kárdex completo de un insumo — para ver todo su historial
    List<HistorialInventario> findByEmpresaIdAndInsumoIdOrderByCreatedAtDesc(
            UUID empresaId,
            UUID insumoId
    );

    // Todos los movimientos de inventario de una empresa
    List<HistorialInventario> findByEmpresaIdOrderByCreatedAtDesc(UUID empresaId);
}
