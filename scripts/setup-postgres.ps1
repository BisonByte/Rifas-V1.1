# Script de instalación de PostgreSQL para Windows
# Sistema de Rifas

Write-Host "🐘 Configurando PostgreSQL para Sistema de Rifas..." -ForegroundColor Green

# Verificar si PostgreSQL está instalado
$pgVersion = Get-Command psql -ErrorAction SilentlyContinue
if (-not $pgVersion) {
    Write-Host "❌ PostgreSQL no encontrado. Por favor instalar PostgreSQL primero:" -ForegroundColor Red
    Write-Host "   1. Ir a: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "   2. Descargar PostgreSQL 15 o superior" -ForegroundColor Yellow
    Write-Host "   3. Instalar con usuario 'postgres' y password a elegir" -ForegroundColor Yellow
    Write-Host "   4. Ejecutar este script nuevamente" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ PostgreSQL encontrado: $($pgVersion.Version)" -ForegroundColor Green

# Configurar variables
$DB_NAME = "sistema_rifas"
$DB_USER = "rifas_user"
$DB_PASSWORD = "rifas_password_2024"

Write-Host "🔧 Configurando base de datos..." -ForegroundColor Blue

# Crear base de datos
Write-Host "Creando base de datos '$DB_NAME'..."
$env:PGPASSWORD = "postgres"  # Cambiar por la password de postgres
psql -U postgres -h localhost -c "CREATE DATABASE $DB_NAME;"

# Crear usuario
Write-Host "Creando usuario '$DB_USER'..."
psql -U postgres -h localhost -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

# Dar permisos
Write-Host "Configurando permisos..."
psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
psql -U postgres -h localhost -c "ALTER USER $DB_USER CREATEDB;"

Write-Host "🎉 PostgreSQL configurado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuración:" -ForegroundColor Yellow
Write-Host "  Database: $DB_NAME" -ForegroundColor White
Write-Host "  User: $DB_USER" -ForegroundColor White
Write-Host "  Password: $DB_PASSWORD" -ForegroundColor White
Write-Host "  Host: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "Connection String:" -ForegroundColor Yellow
Write-Host "  postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public" -ForegroundColor White
