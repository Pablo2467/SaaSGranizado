package com.granizadoexpress.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "suscripciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Suscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "plan_suscripcion")
    @Builder.Default
    private PlanSuscripcion plan = PlanSuscripcion.TRIAL;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "estado_suscripcion")
    @Builder.Default
    private EstadoSuscripcion estado = EstadoSuscripcion.ACTIVA;

    @Column(name = "fecha_inicio", nullable = false)
    @Builder.Default
    private LocalDate fechaInicio = LocalDate.now();

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "monto_mensual", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal montoMensual = BigDecimal.ZERO;

    @Column(name = "es_trial", nullable = false)
    @Builder.Default
    private Boolean esTrial = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PlanSuscripcion { TRIAL, BASICO, PRO }
    public enum EstadoSuscripcion { ACTIVA, VENCIDA, CANCELADA, PAUSADA }
}
