package com.granizadoexpress.repository;

import com.granizadoexpress.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
