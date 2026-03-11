-- Migration: Create app_users table for mobile app users
-- Date: 2026-03-11

CREATE TABLE IF NOT EXISTS app_users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    curp VARCHAR(18) UNIQUE NOT NULL,
    territorio VARCHAR(100) NOT NULL,
    puesto_trabajo VARCHAR(100) NOT NULL,
    supervisor VARCHAR(200),
    telefono VARCHAR(20) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_curp ON app_users(curp);
CREATE INDEX IF NOT EXISTS idx_app_users_territorio ON app_users(territorio);

-- Add comment to table
COMMENT ON TABLE app_users IS 'Usuarios de la aplicación móvil';
