CREATE TABLE insumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id),
    nombre VARCHAR(200) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,
    cantidad_actual DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    stock_minimo DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    alerta_stock BOOLEAN NOT NULL DEFAULT FALSE,
    costo_unitario  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT uq_insumo_empresa_nombre UNIQUE (empresa_id, nombre)
);
CREATE INDEX idx_insumos_empresa ON insumos(empresa_id);
CREATE INDEX idx_insumos_alerta ON insumos(empresa_id, alerta_stock);
