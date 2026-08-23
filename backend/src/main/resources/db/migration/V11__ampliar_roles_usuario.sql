-- Ampliamos el modelo de roles: de 3 roles fijos a un modelo real de SaaS
-- para un negocio de granizados.
--   OWNER  -> DUEÑO                  (todo, incluye planes y dinero)
--   ADMIN  -> ENCARGADO_PRODUCCION   (insumos, recetas, inventario, ve ganancias solo lectura)
--   CAJERO -> se mantiene            (vendedor/cajero, toma y entrega pedidos)
--   nuevo  -> OPERADOR_MAQUINA       (atiende uno o varios sabores en la máquina)

CREATE TYPE rol_usuario_nuevo AS ENUM ('DUENO', 'ENCARGADO_PRODUCCION', 'OPERADOR_MAQUINA', 'CAJERO');

ALTER TABLE usuarios ALTER COLUMN rol DROP DEFAULT;

ALTER TABLE usuarios
    ALTER COLUMN rol TYPE rol_usuario_nuevo
    USING (
        CASE rol::text
            WHEN 'OWNER' THEN 'DUENO'
            WHEN 'ADMIN' THEN 'ENCARGADO_PRODUCCION'
            ELSE rol::text
        END
    )::rol_usuario_nuevo;

ALTER TABLE usuarios ALTER COLUMN rol SET DEFAULT 'CAJERO';

DROP TYPE rol_usuario;
ALTER TYPE rol_usuario_nuevo RENAME TO rol_usuario;

-- Sabores que atiende cada Operador de Máquina. Un operador puede
-- atender varios sabores/máquinas a la vez (relación 1 a muchos).
CREATE TABLE usuario_sabores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    sabor VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_usuario_sabor UNIQUE (usuario_id, sabor)
);
CREATE INDEX idx_usuario_sabores_usuario ON usuario_sabores(usuario_id);