package com.granizadoexpress.service;

import com.granizadoexpress.dto.RecetaRequest;
import com.granizadoexpress.dto.RecetaResponse;
import com.granizadoexpress.entity.Insumo;
import com.granizadoexpress.entity.Producto;
import com.granizadoexpress.entity.Receta;
import com.granizadoexpress.repository.InsumoRepository;
import com.granizadoexpress.repository.ProductoRepository;
import com.granizadoexpress.repository.RecetaRepository;
import com.granizadoexpress.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecetaService {

    private final RecetaRepository recetaRepository;
    private final ProductoRepository productoRepository;
    private final InsumoRepository insumoRepository;

    public List<RecetaResponse> listar(UUID productoId) {
        verificarProductoPropio(productoId); // confirma que el producto es tuyo antes de listar nada
        return recetaRepository.findByProductoId(productoId)
                .stream()
                .map(this::aResponse)
                .toList();
    }

    public RecetaResponse agregar(UUID productoId, RecetaRequest request) {
        Producto producto = verificarProductoPropio(productoId);
        Insumo insumo = verificarInsumoPropio(request.insumoId());

        Receta receta = Receta.builder()
                .producto(producto)
                .insumo(insumo)
                .cantidadRequerida(request.cantidadRequerida())
                .build();

        return aResponse(recetaRepository.save(receta));
    }

    public RecetaResponse actualizar(UUID productoId, UUID recetaId, RecetaRequest request) {
        verificarProductoPropio(productoId);
        Insumo insumo = verificarInsumoPropio(request.insumoId());
        Receta receta = buscarRecetaDelProducto(productoId, recetaId);

        receta.setInsumo(insumo);
        receta.setCantidadRequerida(request.cantidadRequerida());

        return aResponse(recetaRepository.save(receta));
    }

    public void eliminar(UUID productoId, UUID recetaId) {
        verificarProductoPropio(productoId);
        Receta receta = buscarRecetaDelProducto(productoId, recetaId);
        recetaRepository.delete(receta); // sin borrado lógico: una receta vieja sin sentido de conservar
    }

    /**
     * Punto único: confirma que el producto exista Y sea de la empresa
     * actual. Todo método público de este service pasa por aquí primero.
     */
    private Producto verificarProductoPropio(UUID productoId) {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        return productoRepository.findByIdAndEmpresaIdAndDeletedAtIsNull(productoId, empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private Insumo verificarInsumoPropio(UUID insumoId) {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        return insumoRepository.findByIdAndEmpresaIdAndDeletedAtIsNull(insumoId, empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Insumo no encontrado"));
    }

    private Receta buscarRecetaDelProducto(UUID productoId, UUID recetaId) {
        return recetaRepository.findByProductoId(productoId)
                .stream()
                .filter(r -> r.getId().equals(recetaId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receta no encontrada"));
    }

    private RecetaResponse aResponse(Receta receta) {
        return new RecetaResponse(
                receta.getId(),
                receta.getInsumo().getId(),
                receta.getInsumo().getNombre(),
                receta.getInsumo().getUnidadMedida(),
                receta.getCantidadRequerida()
        );
    }
}