# Sistema de Rifas

Sistema profesional de rifas y sorteos desarrollado con [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/) y [Prisma](https://www.prisma.io/).

## Características

- Gestión de rifas y boletos
- Múltiples métodos de pago
- Panel de administración
- Diseño responsivo con Tailwind CSS

## Requisitos previos

- [Node.js](https://nodejs.org/) >= 18
- Base de datos compatible con Prisma (SQLite o PostgreSQL)

## Instalación

```bash
# Clonar el repositorio
 git clone https://github.com/usuario/sistema-rifas.git
 cd sistema-rifas

# Instalar dependencias
 npm install

# Configurar variables de entorno
 cp .env.example .env
 # Editar .env con las credenciales de la base de datos y otras opciones

# Preparar la base de datos
 npx prisma generate
 npx prisma db push

# Poblar datos iniciales
 npm run seed:config
 npm run seed:add-payment-methods
 npx tsx scripts/create-admin.ts

# Ejecutar en modo desarrollo
npm run dev

## Variables de entorno

- DATABASE_URL: cadena de conexión (ej. `file:./dev.db` para SQLite).
- JWT_SECRET: secreto para firmar JWT del backend.
- NEXT_PUBLIC_BASE_URL: URL pública del sitio (ej. `http://localhost:3000`).
- SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD/FROM_EMAIL: configuración SMTP para enviar correos (opcional).
- PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET/PAYPAL_ENV: credenciales PayPal (opcional; `PAYPAL_ENV` = `sandbox` | `live`).
- LOG_LEVEL: `ERROR` | `WARN` | `INFO` (opcional).

Notas:
- Variables `NEXTAUTH_*` no son usadas por este proyecto (autenticación JWT propia).
- Revisa `.env.example` para un ejemplo completo.
