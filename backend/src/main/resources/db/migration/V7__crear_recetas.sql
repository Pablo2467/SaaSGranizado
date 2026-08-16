CREATE TABLE recetas (
    id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES productos(id),
    insumo_id UUID NOT NULL REFERENCES insumos(id),
    cantidad_requerida  DECIMAL(10,3) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_receta_producto_insumo UNIQUE (producto_id, insumo_id),
    CONSTRAINT ck_receta_cantidad CHECK (cantidad_requerida > 0)
);
CREATE INDEX idx_recetas_producto ON recetas(producto_id);
