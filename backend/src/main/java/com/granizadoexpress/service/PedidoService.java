package com.granizadoexpress.service;

import com.granizadoexpress.dto.PedidoRequest;
import com.granizadoexpress.dto.PedidoResponse;
import com.granizadoexpress.entity.*;
import com.granizadoexpress.repository.*;
import com.granizadoexpress.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final InsumoRepository insumoRepository;
    private final RecetaRepository recetaRepository;
    private final HistorialInventarioRepository historialRepository;
    private final EmpresaRepository empresaRepository;

    @Transactional
    public PedidoResponse crear(PedidoRequest request) {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa no encontrada"));

        // 1. Construir las líneas del pedido, verificando que cada producto sea de esta empresa
        List<DetallePedido> detalles = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (PedidoRequest.DetalleRequest detalleReq : request.detalles()) {
            Producto producto = productoRepository.findByIdAndEmpresaIdAndDeletedAtIsNull(detalleReq.productoId(), empresaId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Producto no encontrado: " + detalleReq.productoId()));

            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(detalleReq.cantidad()));
            total = total.add(subtotal);

            DetallePedido detalle = DetallePedido.builder()
                    .producto(producto)
                    .cantidad(detalleReq.cantidad())
                    .precioUnitario(producto.getPrecio())
                    .subtotal(subtotal)
                    .build();
            detalles.add(detalle);
        }

        // 2. Agregar cuánto de cada insumo consume el pedido completo, sumando entre líneas
        Map<UUID, BigDecimal> consumoPorInsumo = new HashMap<>();
        for (DetallePedido detalle : detalles) {
            List<Receta> receta = recetaRepository.findByProductoId(detalle.getProducto().getId());
            for (Receta linea : receta) {
                UUID insumoId = linea.getInsumo().getId();
                BigDecimal cantidadNecesaria = linea.getCantidadRequerida().multiply(BigDecimal.valueOf(detalle.getCantidad()));
                consumoPorInsumo.merge(insumoId, cantidadNecesaria, BigDecimal::add);
            }
        }

        // 3. Verificar stock suficiente de TODOS los insumos ANTES de descontar nada
        //    (fallar rápido, sin dejar descuentos a medias)
        Map<UUID, Insumo> insumosBloqueados = new HashMap<>();
        for (Map.Entry<UUID, BigDecimal> entry : consumoPorInsumo.entrySet()) {
            Insumo insumo = insumoRepository.findByIdParaActualizar(entry.getKey())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Insumo no encontrado"));

            if (insumo.getCantidadActual().compareTo(entry.getValue()) < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Stock insuficiente de " + insumo.getNombre() +
                                " (disponible: " + insumo.getCantidadActual() + " " + insumo.getUnidadMedida() + ")");
            }
            insumosBloqueados.put(insumo.getId(), insumo);
        }

        // 4. Guardar el pedido (con cascade, sus detalles se guardan solos)
        Pedido pedido = Pedido.builder()
                .empresa(empresa)
                .nombreCliente(request.nombreCliente())
                .total(total)
                .canal(request.canal() != null ? Pedido.CanalPedido.valueOf(request.canal()) : Pedido.CanalPedido.WHATSAPP)
                .notas(request.notas())
                .detalles(detalles)
                .build();
        detalles.forEach(d -> d.setPedido(pedido));

        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        // 5. Ahora sí, descontar el inventario y dejar registro en el historial
        for (Map.Entry<UUID, BigDecimal> entry : consumoPorInsumo.entrySet()) {
            Insumo insumo = insumosBloqueados.get(entry.getKey());
            BigDecimal cantidadNecesaria = entry.getValue();
            BigDecimal cantidadAnterior = insumo.getCantidadActual();
            BigDecimal cantidadPosterior = cantidadAnterior.subtract(cantidadNecesaria);

            insumo.setCantidadActual(cantidadPosterior);
            insumo.setAlertaStock(cantidadPosterior.compareTo(insumo.getStockMinimo()) < 0);
            insumoRepository.save(insumo);

            HistorialInventario movimiento = HistorialInventario.builder()
                    .empresa(empresa)
                    .insumo(insumo)
                    .pedido(pedidoGuardado)
                    .tipoMovimiento(HistorialInventario.TipoMovimiento.SALIDA)
                    .cantidad(cantidadNecesaria)
                    .cantidadAnterior(cantidadAnterior)
                    .cantidadPosterior(cantidadPosterior)
                    .motivo("Descuento automático por pedido")
                    .build();
            historialRepository.save(movimiento);
        }

        return aResponse(pedidoGuardado);
    }

    public List<PedidoResponse> listar() {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        return pedidoRepository.findByEmpresaIdOrderByCreatedAtDesc(empresaId)
                .stream()
                .map(this::aResponse)
                .toList();
    }

    public PedidoResponse obtener(UUID id) {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        Pedido pedido = pedidoRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
        return aResponse(pedido);
    }

    private PedidoResponse aResponse(Pedido pedido) {
        List<PedidoResponse.DetalleResponse> detalles = pedido.getDetalles().stream()
                .map(d -> new PedidoResponse.DetalleResponse(
                        d.getProducto().getId(),
                        d.getProducto().getNombre(),
                        d.getCantidad(),
                        d.getPrecioUnitario(),
                        d.getSubtotal()
                ))
                .toList();

        return new PedidoResponse(
                pedido.getId(),
                pedido.getNombreCliente(),
                pedido.getTotal(),
                pedido.getEstado().name(),
                pedido.getCanal().name(),
                pedido.getNotas(),
                pedido.getCreatedAt(),
                detalles
        );
    }
}
