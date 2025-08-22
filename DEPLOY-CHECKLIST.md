# ✅ Lista de Verificación para Despliegue

## Pre-despliegue

### 🔧 Configuración Local
- [ ] Variables de entorno configuradas en `.env`
- [ ] Base de datos inicializada (`npx prisma db push`)
- [ ] Datos semilla ejecutados (`npx tsx scripts/seed-configuracion.ts`)
- [ ] Usuario admin creado (`npx tsx scripts/create-admin.ts`)
- [ ] Build exitoso (`npm run build`)
- [ ] Pruebas locales completadas

### 📋 Archivos Necesarios
- [ ] `package.json` y `package-lock.json`
- [ ] Código fuente en `/src`
- [ ] Esquema Prisma en `/prisma`
- [ ] Scripts de deployment en `/scripts`
- [ ] Archivos estáticos en `/public`
- [ ] Configuraciones: `next.config.js`, `tailwind.config.js`, `tsconfig.json`

## Despliegue en VPS

### 🖥️ Configuración del Servidor
- [ ] Node.js 18+ instalado
- [ ] Base de datos PostgreSQL configurada
- [ ] Nginx/Apache configurado como proxy reverso
- [ ] SSL/HTTPS habilitado (Let's Encrypt)
- [ ] PM2 o similar para gestión de procesos
- [ ] Firewall configurado (puertos 80, 443, 22)

### 🗄️ Base de Datos
- [ ] PostgreSQL instalado y ejecutándose
- [ ] Base de datos creada
- [ ] Usuario de BD con permisos apropiados
- [ ] Migraciones ejecutadas (`npx prisma migrate deploy`)
- [ ] Datos iniciales insertados

### 🌐 Variables de Entorno (Producción)
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/rifas_db"
NEXTAUTH_URL="https://tu-dominio.com"  
NEXT_PUBLIC_BASE_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="secret-muy-seguro-de-32-chars+"
ADMIN_EMAIL="admin@tu-dominio.com"
ADMIN_PASSWORD="password-seguro"
```

### 📦 Comandos de Despliegue
```bash
# 1. Clonar repositorio
git clone <repo-url>
cd sistema-rifas

# 2. Instalar dependencias  
npm ci --only=production

# 3. Generar cliente Prisma
npx prisma generate

# 4. Ejecutar migraciones
npx prisma migrate deploy

# 5. Build de producción
npm run build

# 6. Inicializar datos
npx tsx scripts/init-production-db.ts

# 7. Iniciar con PM2
pm2 start ecosystem.config.json
```

## Despliegue en Vercel

### ☁️ Configuración en Vercel
- [ ] Proyecto conectado a repositorio GitHub
- [ ] Variables de entorno configuradas en dashboard
- [ ] Base de datos externa configurada (PlanetScale, Supabase, etc.)
- [ ] Dominio personalizado configurado (opcional)

### 🗂️ Variables de Entorno en Vercel
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=tu-secret-seguro  
NEXTAUTH_URL=https://tu-app.vercel.app
NEXT_PUBLIC_BASE_URL=https://tu-app.vercel.app
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

## Post-despliegue

### ✅ Verificaciones
- [ ] Sitio web carga correctamente
- [ ] Panel admin accesible (`/admin`)
- [ ] Autenticación funciona
- [ ] Base de datos conectada
- [ ] Formularios envían datos
- [ ] Subida de archivos funciona
- [ ] Notificaciones email/SMS (si configurado)
- [ ] PayPal integrado (si configurado)

### 🔒 Seguridad
- [ ] Credenciales por defecto cambiadas
- [ ] HTTPS habilitado
- [ ] Headers de seguridad configurados
- [ ] Rate limiting configurado (opcional)
- [ ] Backups de BD automatizados

### 📊 Monitoreo
- [ ] Logs de aplicación configurados
- [ ] Monitoreo de uptime (UptimeRobot, etc.)
- [ ] Alertas de errores configuradas
- [ ] Métricas de rendimiento habilitadas

### 🎯 Configuración Inicial
- [ ] Acceder a `/admin/configuracion` y completar:
  - Información del sitio
  - Datos de contacto  
  - Configuración de emails
- [ ] Configurar métodos de pago en `/admin/metodos-pago`
- [ ] Configurar redes sociales en `/admin/redes-sociales`
- [ ] Crear primera rifa de prueba

## Solución de Problemas Comunes

### 🐛 Errores Frecuentes

**Build fallido:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

**Error de conexión BD:**
```bash
npx prisma generate
npx tsx scripts/test-db-connection.ts
```

**Permisos en archivos:**
```bash
sudo chown -R $USER:$USER /path/to/app
chmod -R 755 public/uploads
```

**Error de variables de entorno:**
- Verificar que todas las variables requeridas estén definidas
- Reiniciar servidor después de cambios en .env

### 📞 Contacto de Soporte
Si necesitas ayuda:
1. Revisar logs de la aplicación
2. Verificar configuración de variables de entorno  
3. Consultar documentación en `/docs`
4. Verificar conexión a base de datos

---

🎉 **¡Tu sistema de rifas está listo para producción!**
