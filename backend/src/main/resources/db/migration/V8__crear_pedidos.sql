CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id),
    nombre_cliente  VARCHAR(200),
    total DECIMAL(10,2) NOT NULL,
    estado  estado_pedido NOT NULL DEFAULT 'PENDIENTE',
    canal  canal_pedido NOT NULL DEFAULT 'WHATSAPP',
    notas TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_pedidos_empresa ON pedidos(empresa_id);
CREATE INDEX idx_pedidos_fecha ON pedidos(empresa_id, created_at);
