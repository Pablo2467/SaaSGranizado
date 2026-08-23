package com.granizadoexpress.service;

import com.granizadoexpress.dto.EstadisticasResumenResponse;
import com.granizadoexpress.dto.ProductoVendidoResponse;
import com.granizadoexpress.dto.PuntoGananciaResponse;
import com.granizadoexpress.entity.DetallePedido;
import com.granizadoexpress.entity.Pedido;
import com.granizadoexpress.repository.PedidoRepository;
import com.granizadoexpress.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;


@Service
@RequiredArgsConstructor
public class EstadisticasService {

    private final PedidoRepository pedidoRepository;

    public static final List<Pedido.EstadoPedido> ESTADOS_GANANCIA = List.of(
            Pedido.EstadoPedido.CONFIRMADO,
            Pedido.EstadoPedido.EN_PREPARACION,
            Pedido.EstadoPedido.ENTREGADO
    );

    private static final String[] DIAS_SEMANA = {"Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"};
    private static final String[] MESES = {"Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"};

    public EstadisticasResumenResponse resumen() {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime desde = ahora.minusYears(1);

        List<Pedido> pedidos = pedidoRepository.findParaEstadisticas(empresaId, ESTADOS_GANANCIA, desde, ahora);

        LocalDateTime inicioHoy = ahora.toLocalDate().atStartOfDay();
        LocalDateTime inicioSemana = ahora.toLocalDate().with(DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime inicioMes = ahora.toLocalDate().withDayOfMonth(1).atStartOfDay();
        LocalDateTime inicioAnio = ahora.toLocalDate().withDayOfYear(1).atStartOfDay();

        return new EstadisticasResumenResponse(
                calcularPeriodo(pedidos, inicioHoy, ahora),
                calcularPeriodo(pedidos, inicioSemana, ahora),
                calcularPeriodo(pedidos, inicioMes, ahora),
                calcularPeriodo(pedidos, inicioAnio, ahora)
        );
    }

    public List<PuntoGananciaResponse> serie(String periodo, Integer anioParam, Integer mesParam) {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        LocalDateTime ahora = LocalDateTime.now();
        Rango rango = calcularRango(periodo, ahora, anioParam, mesParam);

        List<Pedido> pedidos = pedidoRepository.findParaEstadisticas(empresaId, ESTADOS_GANANCIA, rango.inicio, rango.fin);

        return switch (periodo) {
            case "dia" -> serieHoraria(pedidos, rango.inicio.toLocalDate());
            case "semana" -> serieSemanal(pedidos, rango.inicio.toLocalDate());
            case "mes" -> serieMensual(pedidos, rango.anio, rango.mes);
            case "anio" -> serieAnual(pedidos, rango.anio);
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Periodo inválido: " + periodo);
        };
    }

    public List<ProductoVendidoResponse> porProducto(String periodo, Integer anioParam, Integer mesParam) {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        LocalDateTime ahora = LocalDateTime.now();
        Rango rango = calcularRango(periodo, ahora, anioParam, mesParam);

        List<Pedido> pedidos = pedidoRepository.findParaEstadisticas(empresaId, ESTADOS_GANANCIA, rango.inicio, rango.fin);

        Map<String, long[]> unidades = new LinkedHashMap<>(); // truco simple para acumular cantidad
        Map<String, BigDecimal> totales = new LinkedHashMap<>();

        for (Pedido pedido : pedidos) {
            for (DetallePedido detalle : pedido.getDetalles()) {
                String nombre = detalle.getProducto().getNombre();
                unidades.merge(nombre, new long[]{detalle.getCantidad()}, (a, b) -> new long[]{a[0] + b[0]});
                totales.merge(nombre, detalle.getSubtotal(), BigDecimal::add);
            }
        }

        return unidades.entrySet().stream()
                .map(e -> new ProductoVendidoResponse(e.getKey(), e.getValue()[0], totales.get(e.getKey())))
                .sorted(Comparator.comparing(ProductoVendidoResponse::total).reversed())
                .toList();
    }

    // ---------- Rango de fechas según el corte elegido ----------

    private record Rango(LocalDateTime inicio, LocalDateTime fin, int anio, int mes) {}

    private Rango calcularRango(String periodo, LocalDateTime ahora, Integer anioParam, Integer mesParam) {
        return switch (periodo) {
            case "dia" -> {
                LocalDateTime inicio = ahora.toLocalDate().atStartOfDay();
                yield new Rango(inicio, ahora, ahora.getYear(), ahora.getMonthValue());
            }
            case "semana" -> {
                LocalDateTime inicio = ahora.toLocalDate().with(DayOfWeek.MONDAY).atStartOfDay();
                yield new Rango(inicio, ahora, ahora.getYear(), ahora.getMonthValue());
            }
            case "mes" -> {
                int anio = anioParam != null ? anioParam : ahora.getYear();
                int mes = mesParam != null ? mesParam : ahora.getMonthValue();
                YearMonth ym = YearMonth.of(anio, mes);
                LocalDateTime inicio = ym.atDay(1).atStartOfDay();
                LocalDateTime finMes = ym.atEndOfMonth().atTime(23, 59, 59);
                LocalDateTime fin = finMes.isAfter(ahora) ? ahora : finMes;
                yield new Rango(inicio, fin.isBefore(inicio) ? inicio : fin, anio, mes);
            }
            case "anio" -> {
                int anio = anioParam != null ? anioParam : ahora.getYear();
                LocalDateTime inicio = LocalDate.of(anio, 1, 1).atStartOfDay();
                LocalDateTime finAnio = LocalDate.of(anio, 12, 31).atTime(23, 59, 59);
                LocalDateTime fin = finAnio.isAfter(ahora) ? ahora : finAnio;
                yield new Rango(inicio, fin.isBefore(inicio) ? inicio : fin, anio, ahora.getMonthValue());
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Periodo inválido: " + periodo);
        };
    }

    // ---------- Agregaciones ----------

    private EstadisticasResumenResponse.PeriodoResumen calcularPeriodo(
            List<Pedido> pedidos, LocalDateTime inicio, LocalDateTime fin) {
        List<Pedido> filtrados = pedidos.stream()
                .filter(p -> !p.getCreatedAt().isBefore(inicio) && !p.getCreatedAt().isAfter(fin))
                .toList();

        BigDecimal total = filtrados.stream()
                .map(Pedido::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long cantidad = filtrados.size();
        BigDecimal ticketPromedio = cantidad > 0
                ? total.divide(BigDecimal.valueOf(cantidad), 0, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new EstadisticasResumenResponse.PeriodoResumen(total, cantidad, ticketPromedio);
    }

    private List<PuntoGananciaResponse> serieHoraria(List<Pedido> pedidos, LocalDate dia) {
        List<PuntoGananciaResponse> puntos = new ArrayList<>();
        for (int hora = 0; hora < 24; hora++) {
            int h = hora;
            List<Pedido> delBloque = pedidos.stream()
                    .filter(p -> p.getCreatedAt().toLocalDate().equals(dia) && p.getCreatedAt().getHour() == h)
                    .toList();
            puntos.add(new PuntoGananciaResponse(
                    String.format("%02d:00", hora),
                    sumar(delBloque),
                    delBloque.size()
            ));
        }
        return puntos;
    }

    private List<PuntoGananciaResponse> serieSemanal(List<Pedido> pedidos, LocalDate lunes) {
        List<PuntoGananciaResponse> puntos = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate dia = lunes.plusDays(i);
            List<Pedido> delDia = pedidos.stream()
                    .filter(p -> p.getCreatedAt().toLocalDate().equals(dia))
                    .toList();
            puntos.add(new PuntoGananciaResponse(DIAS_SEMANA[i], sumar(delDia), delDia.size()));
        }
        return puntos;
    }

    private List<PuntoGananciaResponse> serieMensual(List<Pedido> pedidos, int anio, int mes) {
        YearMonth ym = YearMonth.of(anio, mes);
        int dias = ym.lengthOfMonth();
        List<PuntoGananciaResponse> puntos = new ArrayList<>();
        for (int dia = 1; dia <= dias; dia++) {
            int d = dia;
            List<Pedido> delDia = pedidos.stream()
                    .filter(p -> p.getCreatedAt().getDayOfMonth() == d
                            && p.getCreatedAt().getMonthValue() == mes
                            && p.getCreatedAt().getYear() == anio)
                    .toList();
            puntos.add(new PuntoGananciaResponse(String.valueOf(dia), sumar(delDia), delDia.size()));
        }
        return puntos;
    }

    private List<PuntoGananciaResponse> serieAnual(List<Pedido> pedidos, int anio) {
        List<PuntoGananciaResponse> puntos = new ArrayList<>();
        for (int mes = 1; mes <= 12; mes++) {
            int m = mes;
            List<Pedido> delMes = pedidos.stream()
                    .filter(p -> p.getCreatedAt().getMonthValue() == m && p.getCreatedAt().getYear() == anio)
                    .toList();
            puntos.add(new PuntoGananciaResponse(MESES[mes - 1], sumar(delMes), delMes.size()));
        }
        return puntos;
    }

    private BigDecimal sumar(List<Pedido> pedidos) {
        return pedidos.stream().map(Pedido::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
