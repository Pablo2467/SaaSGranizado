CREATE TABLE suscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id),
    plan  plan_suscripcion NOT NULL DEFAULT 'TRIAL',
    estado estado_suscripcion NOT NULL DEFAULT 'ACTIVA',
    fecha_inicio  DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE NOT NULL,
    monto_mensual DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    es_trial BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_suscripciones_empresa ON suscripciones(empresa_id);
CREATE INDEX idx_suscripciones_estado ON suscripciones(estado);
