package com.granizadoexpress.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "historial_inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HistorialInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insumo_id", nullable = false)
    private Insumo insumo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "tipo_movimiento", nullable = false, columnDefinition = "tipo_movimiento")
    private TipoMovimiento tipoMovimiento;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal cantidad;

    @Column(name = "cantidad_anterior", nullable = false, precision = 10, scale = 3)
    private BigDecimal cantidadAnterior;

    @Column(name = "cantidad_posterior", nullable = false, precision = 10, scale = 3)
    private BigDecimal cantidadPosterior;

    @Column(length = 300)
    private String motivo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum TipoMovimiento {
        ENTRADA, SALIDA, AJUSTE_MANUAL
    }
}