-- Seed SQL — Mini E-commerce Wise Sales
-- Este script roda automaticamente ao subir o PostgreSQL via docker-compose.

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Produtos
-- Estoque variado de propósito: 0 (não pode adicionar), 1-2 (limite baixo), 3+ (normal)
INSERT INTO products (name, category, price, stock, image_url) VALUES
    ('Camiseta Básica Preta',  'roupas',     49.90,  15, NULL),
    ('Calça Jeans Slim',       'roupas',    129.90,   8, NULL),
    ('Tênis Corrida Pro',      'calçados',  299.90,   3, NULL),
    ('Mochila Notebook 15"',   'acessórios', 89.90,   0, NULL),
    ('Boné Esportivo',         'acessórios', 39.90,   2, NULL),
    ('Jaqueta Corta-Vento',    'roupas',    179.90,   1, NULL);

-- Cupons
-- EXPIRADO20 tem active=true mas expires_at no passado (pegadinha intencional)
INSERT INTO coupons (code, discount_type, discount_value, active, expires_at) VALUES
    ('DESCONTO10',  'percentage', 10.00, TRUE,  '2099-12-31 23:59:59'),
    ('VALE15',      'fixed',     15.00, TRUE,  '2099-12-31 23:59:59'),
    ('EXPIRADO20',  'percentage', 20.00, TRUE,  '2024-01-01 00:00:00');
