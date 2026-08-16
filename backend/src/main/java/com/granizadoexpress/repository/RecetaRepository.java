package com.granizadoexpress.repository;


import com.granizadoexpress.entity.Receta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RecetaRepository extends JpaRepository<Receta, UUID> {

    //Todos los insumos que consume un producto
    List<Receta> findByProductoId(UUID productoId);

    //Elimina todas las recetas de un producto o ingredientes
    void deleteByProductoId(UUID productoId);
}
