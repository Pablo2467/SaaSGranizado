package com.granizadoexpress.service;

import com.granizadoexpress.dto.InsumoRequest;
import com.granizadoexpress.dto.InsumoResponse;
import com.granizadoexpress.entity.Empresa;
import com.granizadoexpress.entity.Insumo;
import com.granizadoexpress.repository.EmpresaRepository;
import com.granizadoexpress.repository.InsumoRepository;
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
public class InsumoService {

    private final InsumoRepository insumoRepository;
    private final EmpresaRepository empresaRepository;

    public InsumoResponse crear(InsumoRequest request) {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa no encontrada"));

        Insumo insumo = Insumo.builder()
                .empresa(empresa)
                .nombre(request.nombre())
                .unidadMedida(request.unidadMedida())
                .cantidadActual(request.cantidadActual())
                .stockMinimo(request.stockMinimo())
                .costoUnitario(request.costoUnitario())
                .alertaStock(calcularAlerta(request.cantidadActual(), request.stockMinimo()))
                .build();

        return aResponse(insumoRepository.save(insumo));
    }

    public List<InsumoResponse> listar() {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        return insumoRepository.findByEmpresaIdAndDeletedAtIsNull(empresaId)
                .stream()
                .map(this::aResponse)
                .toList();
    }

    public InsumoResponse obtener(UUID id) {
        return aResponse(buscarPropioOFallar(id));
    }

    public InsumoResponse actualizar(UUID id, InsumoRequest request) {
        Insumo insumo = buscarPropioOFallar(id);

        insumo.setNombre(request.nombre());
        insumo.setUnidadMedida(request.unidadMedida());
        insumo.setCantidadActual(request.cantidadActual());
        insumo.setStockMinimo(request.stockMinimo());
        insumo.setCostoUnitario(request.costoUnitario());
        insumo.setAlertaStock(calcularAlerta(request.cantidadActual(), request.stockMinimo()));

        return aResponse(insumoRepository.save(insumo));
    }

    public void eliminar(UUID id) {
        Insumo insumo = buscarPropioOFallar(id);
        insumo.setDeletedAt(LocalDateTime.now());
        insumoRepository.save(insumo);
    }

    private Insumo buscarPropioOFallar(UUID id) {
        UUID empresaId = SecurityUtils.obtenerEmpresaId();
        return insumoRepository.findByIdAndEmpresaIdAndDeletedAtIsNull(id, empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Insumo no encontrado"));
    }

    private boolean calcularAlerta(java.math.BigDecimal cantidadActual, java.math.BigDecimal stockMinimo) {
        return cantidadActual.compareTo(stockMinimo) < 0;
    }

    private InsumoResponse aResponse(Insumo insumo) {
        return new InsumoResponse(
                insumo.getId(),
                insumo.getNombre(),
                insumo.getUnidadMedida(),
                insumo.getCantidadActual(),
                insumo.getStockMinimo(),
                insumo.getAlertaStock(),
                insumo.getCostoUnitario()
        );
    }
}
