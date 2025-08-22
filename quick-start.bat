@echo off
REM 🚀 QUICK START - Sistema de Rifas (Windows)
REM Este script configura automáticamente el sistema en un entorno limpio

echo 🚀 Iniciando configuración del Sistema de Rifas...

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado. Instalar Node.js 18+ y reintentar.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
node --version

REM Instalar dependencias
echo 📦 Instalando dependencias...
npm install
if errorlevel 1 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

REM Verificar si existe .env
if not exist .env (
    echo ⚙️  Creando archivo .env desde .env.example...
    copy .env.example .env
    echo 🔧 Editar .env con tus configuraciones antes de continuar.
    echo 📝 Variables importantes: DATABASE_URL, NEXTAUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
    pause
)

REM Generar cliente Prisma
echo 🗄️  Generando cliente Prisma...
npx prisma generate
if errorlevel 1 (
    echo ❌ Error generando cliente Prisma
    pause
    exit /b 1
)

REM Configurar base de datos
echo 🗄️  Configurando base de datos...
npx prisma db push
if errorlevel 1 (
    echo ❌ Error configurando base de datos
    pause
    exit /b 1
)

REM Sembrar configuración inicial
echo 🌱 Sembrando datos iniciales...
npx tsx scripts/seed-configuracion.ts

REM Crear usuario admin
echo 👤 Creando usuario administrador...
npx tsx scripts/create-admin.ts

REM Verificar build
echo 🔨 Verificando build de producción...
npm run build
if errorlevel 1 (
    echo ❌ Error en build. Revisar errores arriba.
    pause
    exit /b 1
)

echo.
echo 🎉 ¡Configuración completada!
echo.
echo 🚀 Para iniciar en desarrollo:
echo    npm run dev
echo.
echo 🏭 Para iniciar en producción:
echo    npm start
echo.
echo 🔐 Panel de administración:
echo    http://localhost:3000/admin
echo.
echo 📋 Revisa las credenciales por defecto en el archivo .env
echo.
echo ⚠️  IMPORTANTE: Cambiar credenciales por defecto en producción
echo.
pause
