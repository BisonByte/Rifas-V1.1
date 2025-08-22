# Sistema de Rifas - Instalación y Despliegue

## 🚀 Instalación Rápida

### Requisitos Previos
- Node.js 18+ 
- npm o yarn
- Base de datos (SQLite para desarrollo, PostgreSQL recomendado para producción)

### 1. Instalación Local

```bash
# Clonar el repositorio
git clone <repository-url>
cd sistema-rifas

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Configurar base de datos
npx prisma generate
npx prisma db push

# Sembrar datos iniciales
npx tsx scripts/seed-configuracion.ts
npx tsx scripts/create-admin.ts

# Iniciar en modo desarrollo
npm run dev
```

### 2. Despliegue en VPS

```bash
# Ejecutar script de configuración VPS
./scripts/deploy/setup-vps.ps1

# O manualmente:
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/            # Componentes reutilizables
│   ├── features/             # Características por módulo
│   ├── lib/                  # Utilidades y configuraciones
│   └── types/               # Definiciones TypeScript
├── prisma/                   # Esquema y migraciones de BD
├── scripts/                  # Scripts de utilidad
├── public/                   # Archivos estáticos
└── docs/                     # Documentación
```

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Base de datos
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="tu-secret-super-seguro"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

# PayPal (opcional)
PAYPAL_CLIENT_ID="tu-paypal-client-id"
PAYPAL_CLIENT_SECRET="tu-paypal-client-secret"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASSWORD="tu-password"

# SMS (opcional)
TWILIO_ACCOUNT_SID="tu-twilio-sid"
TWILIO_AUTH_TOKEN="tu-twilio-token"
TWILIO_PHONE_NUMBER="tu-numero-twilio"
```

### Para Producción (PostgreSQL)

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/rifas_db"
NEXTAUTH_URL="https://tu-dominio.com"
NEXT_PUBLIC_BASE_URL="https://tu-dominio.com"
```

## 🛠️ Scripts Útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Build de producción
npm run start           # Servidor de producción
npm run lint            # Linter

# Base de datos
npx prisma generate     # Generar cliente Prisma
npx prisma db push      # Aplicar cambios sin migraciones
npx prisma migrate dev  # Crear nueva migración
npx prisma studio       # Interface visual de BD

# Scripts personalizados
npx tsx scripts/create-admin.ts              # Crear usuario admin
npx tsx scripts/seed-configuracion.ts        # Sembrar configuración
npx tsx scripts/add-test-data.ts            # Datos de prueba
npx tsx scripts/init-production-db.ts       # Inicializar BD producción
```

## 🔐 Acceso Inicial

1. **Admin**: `/admin`
   - Email: `admin@example.com` (o el configurado en .env)
   - Password: `admin123` (o el configurado en .env)

2. **Usuario público**: `/`

## 📦 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio GitHub a Vercel
2. Configura las variables de entorno en Vercel
3. Despliega automáticamente

### VPS Manual

1. Sube el código al servidor
2. Ejecuta `./scripts/deploy/setup-vps.ps1`
3. Configura nginx/apache como proxy reverso
4. Configura SSL con Let's Encrypt

### Docker

```bash
docker-compose up -d
```

## 🔧 Personalización

### Configuración General
- Accede a `/admin/configuracion`
- Modifica título, descripción, contacto, etc.

### Métodos de Pago
- Configurar en `/admin/metodos-pago`
- Soporta PayPal, transferencias bancarias, etc.

### Redes Sociales
- Configurar en `/admin/redes-sociales`
- Soporta Instagram, WhatsApp, TikTok, etc.

## 🐛 Solución de Problemas

### Error de conexión a BD
```bash
# Verificar conexión
npx tsx scripts/test-db-connection.ts

# Regenerar cliente Prisma
npx prisma generate
```

### Error de permisos en VPS
```bash
# Cambiar propietario de archivos
sudo chown -R $USER:$USER /path/to/app
```

### Error de build
```bash
# Limpiar caché
rm -rf .next node_modules
npm install
npm run build
```

## 📞 Soporte

Para problemas o consultas:
- Revisar documentación en `/docs`
- Consultar logs de la aplicación
- Verificar configuración de variables de entorno

## 🔒 Seguridad

- Cambiar credenciales por defecto
- Usar HTTPS en producción
- Configurar variables de entorno seguras
- Actualizar dependencias regularmente

---

**¡Tu sistema de rifas está listo para usar!** 🎉
