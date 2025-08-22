#!/bin/bash

# 🚀 QUICK START - Sistema de Rifas
# Este script configura automáticamente el sistema en un entorno limpio

echo "🚀 Iniciando configuración del Sistema de Rifas..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instalar Node.js 18+ y reintentar."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar si existe .env
if [ ! -f .env ]; then
    echo "⚙️  Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "🔧 Editar .env con tus configuraciones antes de continuar."
    echo "📝 Variables importantes: DATABASE_URL, NEXTAUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD"
    read -p "Presiona Enter cuando hayas configurado .env..."
fi

# Generar cliente Prisma
echo "🗄️  Generando cliente Prisma..."
npx prisma generate

# Configurar base de datos
echo "🗄️  Configurando base de datos..."
npx prisma db push

# Sembrar configuración inicial
echo "🌱 Sembrando datos iniciales..."
npx tsx scripts/seed-configuracion.ts

# Crear usuario admin
echo "👤 Creando usuario administrador..."
npx tsx scripts/create-admin.ts

# Verificar build
echo "🔨 Verificando build de producción..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build exitoso!"
else
    echo "❌ Error en build. Revisar errores arriba."
    exit 1
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "🚀 Para iniciar en desarrollo:"
echo "   npm run dev"
echo ""
echo "🏭 Para iniciar en producción:"
echo "   npm start"
echo ""
echo "🔐 Panel de administración:"
echo "   http://localhost:3000/admin"
echo ""
echo "📋 Credenciales por defecto:"
echo "   Email: $(grep ADMIN_EMAIL .env | cut -d '=' -f2 | tr -d '\"')"
echo "   Password: $(grep ADMIN_PASSWORD .env | cut -d '=' -f2 | tr -d '\"')"
echo ""
echo "⚠️  IMPORTANTE: Cambiar credenciales por defecto en producción"
echo ""
