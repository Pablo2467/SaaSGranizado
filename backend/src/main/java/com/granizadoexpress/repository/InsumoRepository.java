package com.granizadoexpress.repository;

import com.granizadoexpress.entity.Insumo;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InsumoRepository extends JpaRepository<Insumo, UUID> {
    // Listar todos los insumos activos de una empresa
    List<Insumo> findByEmpresaIdAndDeletedAtIsNull(UUID empresaId);
    Optional<Insumo> findByIdAndEmpresaIdAndDeletedAtIsNull(UUID id, UUID empresaId);
    // Lista de los insumos con alerta de stock
    List<Insumo> findByEmpresaIdAndAlertaStockTrueAndDeletedAtIsNull(UUID empresaId);


    //Bloquea la fila para evitar condiciones de carrera
    //Cuando dos pedidos llegan al mismo tiempo, solo uno puede leer y modificar el stock
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Insumo i WHERE i.id = :id")
    Optional<Insumo> findByIdParaActualizar(@Param("id") UUID id);
}
