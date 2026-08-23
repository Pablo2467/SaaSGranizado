package com.granizadoexpress.service;

import com.granizadoexpress.dto.PedidoInfoUpdateRequest;
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

    // Estados que ya no pueden modificarse: son estados "finales" del pedido.
    private static final Set<Pedido.EstadoPedido> ESTADOS_FINALES =
            EnumSet.of(Pedido.EstadoPedido.ENTREGADO, Pedido.EstadoPedido.CANCELADO);

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
        return aResponse(buscarPropioOFallar(id));
    }

    /**
     * Edita los datos "blandos" del pedido (cliente, canal, notas).
     * No permite tocar los productos/cantidades del pedido para no desincronizar
     * el inventario ya descontado; para eso hay que cancelar y crear uno nuevo.
     */
    @Transactional
    public PedidoResponse actualizarInfo(UUID id, PedidoInfoUpdateRequest request) {
        Pedido pedido = buscarPropioOFallar(id);

        if (pedido.getEstado() == Pedido.EstadoPedido.CANCELADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede editar un pedido cancelado");
        }

        if (request.nombreCliente() != null) {
            pedido.setNombreCliente(request.nombreCliente());
        }
        if (request.canal() != null) {
            pedido.setCanal(Pedido.CanalPedido.valueOf(request.canal()));
        }
        if (request.notas() != null) {
            pedido.setNotas(request.notas());
        }

        return aResponse(pedidoRepository.save(pedido));
    }

    /**
     * Cambia el estado del pedido siguiendo el flujo natural del negocio:
     * PENDIENTE -> CONFIRMADO -> EN_PREPARACION -> ENTREGADO, o CANCELADO en cualquier momento
     * (antes de ENTREGADO). Al cancelar, repone automáticamente el inventario consumido.
     */
    @Transactional
    public PedidoResponse cambiarEstado(UUID id, String nuevoEstadoTexto) {
        Pedido pedido = buscarPropioOFallar(id);

        Pedido.EstadoPedido nuevoEstado;
        try {
            nuevoEstado = Pedido.EstadoPedido.valueOf(nuevoEstadoTexto);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado inválido: " + nuevoEstadoTexto);
        }

        if (ESTADOS_FINALES.contains(pedido.getEstado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Este pedido ya está " + textoEstado(pedido.getEstado()) + " y no puede cambiar de estado");
        }

        if (nuevoEstado == Pedido.EstadoPedido.CANCELADO) {
            reponerInventario(pedido);
        }

        pedido.setEstado(nuevoEstado);
        return aResponse(pedidoRepository.save(pedido));
    }

    /**
     * "Eliminar" un pedido en realidad lo cancela: repone el inventario que había
     * descontado y lo marca como CANCELADO, conservando el historial para trazabilidad.
     */
    @Transactional
    public void eliminar(UUID id) {
        Pedido pedido = buscarPropioOFallar(id);

        if (pedido.getEstado() == Pedido.EstadoPedido.CANCELADO) {
            return;
        }
        if (pedido.getEstado() == Pedido.EstadoPedido.ENTREGADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se puede eliminar un pedido que ya fue entregado");
        }

        reponerInventario(pedido);
        pedido.setEstado(Pedido.EstadoPedido.CANCELADO);
        pedidoRepository.save(pedido);
    }

    private void reponerInventario(Pedido pedido) {
        List<HistorialInventario> salidas = historialRepository
                .findByPedidoIdAndTipoMovimiento(pedido.getId(), HistorialInventario.TipoMovimiento.SALIDA);

        for (HistorialInventario salida : salidas) {
            Insumo insumo = insumoRepository.findByIdParaActualizar(salida.getInsumo().getId()).orElse(null);
            if (insumo == null) continue;

            BigDecimal cantidadAnterior = insumo.getCantidadActual();
            BigDecimal cantidadPosterior = cantidadAnterior.add(salida.getCantidad());

            insumo.setCantidadActual(cantidadPosterior);
            insumo.setAlertaStock(cantidadPosterior.compareTo(insumo.getStockMinimo()) < 0);
            insumoRepository.save(insumo);

            HistorialInventario reverso = HistorialInventario.builder()
                    .empresa(pedido.getEmpresa())
                    .insumo(insumo)
                    .pedido(pedido)
                    .tipoMovimiento(HistorialInventario.TipoMovimiento.ENTRADA)
                    .cantidad(salida.getCantidad())
                    .cantidadAnterior(cantidadAnterior)
                    .cantidadPosterior(cantidadPosterior)
                    .motivo("Reposición automática por cancelación de pedido")
                    .build();
            historialRepository.save(reverso);
        }
    }

    private Pedido buscarPropioOFallar(UUID id) {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        return pedidoRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
    }

    private String textoEstado(Pedido.EstadoPedido estado) {
        return switch (estado) {
            case ENTREGADO -> "entregado";
            case CANCELADO -> "cancelado";
            default -> estado.name().toLowerCase();
        };
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
