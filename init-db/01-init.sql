-- Script de inicialización para PostgreSQL
-- Sistema de Rifas

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Crear esquema principal si no existe
CREATE SCHEMA IF NOT EXISTS public;

-- Configurar timezone por defecto
SET timezone = 'America/Mexico_City';

-- Crear usuario adicional para la aplicación (opcional)
-- CREATE USER app_user WITH PASSWORD 'app_password';
-- GRANT ALL PRIVILEGES ON DATABASE sistema_rifas TO app_user;

-- Log de inicialización
INSERT INTO pg_stat_statements_info (dealloc) VALUES (0) ON CONFLICT DO NOTHING;

-- Mensaje de confirmación
SELECT 'Base de datos inicializada correctamente para Sistema de Rifas' AS status;
