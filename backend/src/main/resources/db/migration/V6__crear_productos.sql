CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id),
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio  DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL DEFAULT 'General',
    imagen_url VARCHAR(500),
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT uq_producto_empresa_nombre UNIQUE (empresa_id, nombre)
);
CREATE INDEX idx_productos_empresa ON productos(empresa_id);
CREATE INDEX idx_productos_disponible ON productos(empresa_id, disponible);
