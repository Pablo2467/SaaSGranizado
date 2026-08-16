CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    nit VARCHAR(20),
    whatsapp VARCHAR(20) NOT NULL,
    logo_url VARCHAR(500),
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMP
);
CREATE INDEX idx_empresas_slug ON empresas(slug);
CREATE INDEX idx_empresas_activa ON empresas(activa);
