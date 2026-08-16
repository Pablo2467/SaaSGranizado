package com.granizadoexpress.service;

import com.granizadoexpress.dto.ProductoRequest;
import com.granizadoexpress.dto.ProductoResponse;
import com.granizadoexpress.entity.Empresa;
import com.granizadoexpress.entity.Producto;
import com.granizadoexpress.repository.EmpresaRepository;
import com.granizadoexpress.repository.ProductoRepository;
import com.granizadoexpress.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final EmpresaRepository empresaRepository;
    private final SuscripcionService suscripcionService;   // ← NUEVO campo

    public ProductoResponse crear(ProductoRequest request) {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();

        // ← NUEVA línea: verifica el límite del plan ANTES de crear nada
        suscripcionService.verificarLimiteProductos(
                (int) productoRepository.findByEmpresaIdAndDeletedAtIsNull(empresaId).size()
        );

        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa no disponible"));

        Producto producto = Producto.builder()
                .empresa(empresa)
                .nombre(request.nombre())
                .descripcion(request.descripcion())
                .precio(request.precio())
                .categoria(request.categoria())
                .imagenUrl(request.imagenUrl())
                .disponible(true)
                .build();

        Producto guardado = productoRepository.save(producto);
        return aResponse(guardado);
    }

    public List<ProductoResponse> listar() {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        return productoRepository.findByEmpresaIdAndDeletedAtIsNull(empresaId)
                .stream()
                .map(this::aResponse)
                .toList();
    }

    public ProductoResponse obtener(UUID id) {
        return aResponse(buscarPropioOFallar(id));
    }

    public ProductoResponse actualizar(UUID id, ProductoRequest request) {
        Producto producto = buscarPropioOFallar(id);

        producto.setNombre(request.nombre());
        producto.setDescripcion(request.descripcion());
        producto.setPrecio(request.precio());
        producto.setCategoria(request.categoria());
        producto.setImagenUrl(request.imagenUrl());

        Producto actualizado = productoRepository.save(producto);
        return aResponse(actualizado);
    }

    public void eliminar(UUID id) {
        Producto producto = buscarPropioOFallar(id);
        producto.setDeletedAt(LocalDateTime.now());
        productoRepository.save(producto);
    }

    private Producto buscarPropioOFallar(UUID id) {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        return productoRepository.findByIdAndEmpresaIdAndDeletedAtIsNull(id, empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no disponible"));
    }

    private ProductoResponse aResponse(Producto producto) {
        return new ProductoResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getPrecio(),
                producto.getCategoria(),
                producto.getImagenUrl(),
                producto.getDisponible()
        );
    }
}