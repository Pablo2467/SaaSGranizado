package com.granizadoexpress.repository;

import com.granizadoexpress.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, UUID> {

    //Muestra el historial de pedidos de una empresa ordenando por fecha
    List<Pedido> findByEmpresaIdOrderByCreatedAtDesc(UUID empresaId);

    //Pedidos del dia para el dashboard
    List<Pedido> findByEmpresaIdAndCreatedAtBetweenOrderByCreatedAtDesc(UUID empresaId, LocalDateTime inicio, LocalDateTime fin);

    //Busca un pedido verificando que pertenezca al local o empresa
    Optional<Pedido> findByIdAndEmpresaId(UUID id, UUID empresaId);

    //Trae pedidos (con sus detalles y productos precargados) para calcular ganancias/estadísticas,
    //filtrando por los estados que realmente cuentan como venta confirmada.
    @Query("SELECT DISTINCT p FROM Pedido p " +
            "LEFT JOIN FETCH p.detalles d " +
            "LEFT JOIN FETCH d.producto " +
            "WHERE p.empresa.id = :empresaId " +
            "AND p.estado IN :estados " +
            "AND p.createdAt BETWEEN :inicio AND :fin " +
            "ORDER BY p.createdAt")
    List<Pedido> findParaEstadisticas(
            @Param("empresaId") UUID empresaId,
            @Param("estados") List<Pedido.EstadoPedido> estados,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );
}