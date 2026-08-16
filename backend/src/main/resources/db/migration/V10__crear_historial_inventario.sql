CREATE TABLE historial_inventario (
    id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id),
    insumo_id UUID NOT NULL REFERENCES insumos(id),
    pedido_id UUID REFERENCES pedidos(id),
    tipo_movimiento tipo_movimiento NOT NULL,
    cantidad DECIMAL(10,3) NOT NULL,
    cantidad_anterior DECIMAL(10,3) NOT NULL,
    cantidad_posterior DECIMAL(10,3) NOT NULL,
    motivo VARCHAR(300),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_historial_empresa ON historial_inventario(empresa_id);
CREATE INDEX idx_historial_insumo ON historial_inventario(empresa_id, insumo_id);
CREATE INDEX idx_historial_fecha ON historial_inventario(empresa_id, created_at);
