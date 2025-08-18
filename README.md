# 🎯 Sistema de Rifas Profesional

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Un sistema completo de rifas desarrollado con **Next.js 14**, **Prisma** y **TypeScript**, diseñado para gestionar rifas de manera profesional con una interfaz moderna y animaciones fluidas.

## ✨ Características Principales

- 🎨 **Diseño Moderno**: Interfaz profesional con efectos glassmorphism y animaciones fluidas
- 🔐 **Autenticación Segura**: Sistema de login para administradores con JWT
- 📊 **Panel de Administración**: Dashboard completo con estadísticas en tiempo real
- 🎫 **Gestión de Tickets**: Sistema completo de reserva y venta de boletos
- 💳 **Pagos Integrados**: Gestión de métodos de pago y verificación automática
- 📱 **Totalmente Responsive**: Optimizado para móviles, tablets y escritorio
- ⚡ **Alto Rendimiento**: Optimizado con Next.js 14 y App Router
- 🎯 **SEO Optimizado**: Metadatos y estructura optimizada para buscadores

## 🛠 Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework React con App Router
- **React 18** - Biblioteca de interfaces de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework de CSS utilitario
- **shadcn/ui** - Componentes de UI modernos
- **Lucide Icons** - Iconografía moderna

### Backend
- **Next.js API Routes** - API endpoints serverless
- **Prisma ORM** - ORM moderno para base de datos
- **SQLite/PostgreSQL** - Base de datos (configurable)
- **JWT** - Autenticación segura con tokens

### Herramientas de Desarrollo
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **TypeScript** - Verificación de tipos

## 🚀 Instalación Rápida

### Prerrequisitos
- Node.js 18+ 
- npm, yarn o pnpm

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/sistema-rifas.git
cd sistema-rifas
```

### 2. Instalar Dependencias
```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3. Configurar Variables de Entorno
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus configuraciones:
```bash
# Base de datos
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="tu-clave-secreta-muy-segura"

# Configuración de la aplicación
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-para-nextauth"

# Configuración opcional
UPLOAD_DIR="./public/uploads"
```

### 4. Configurar Base de Datos
```bash
# Generar cliente de Prisma
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# Sembrar datos iniciales (opcional)
npm run seed:config
npm run seed:add-test-data
```

### 5. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
sistema-rifas/
├── src/
│   ├── app/                    # App Router de Next.js 14
│   │   ├── admin/             # Panel de administración
│   │   ├── api/               # API Routes
│   │   └── ...
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/                # Componentes de UI base
│   │   ├── landing/           # Componentes de landing
│   │   └── admin/             # Componentes de administración
│   ├── lib/                   # Utilidades y configuración
│   └── types/                 # Definiciones de TypeScript
├── prisma/                    # Esquema y migraciones de BD
├── public/                    # Archivos estáticos
├── scripts/                   # Scripts de utilidad
└── docs/                      # Documentación
```

## 🎮 Scripts Disponibles

### Desarrollo
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia la aplicación en producción
- `npm run lint` - Ejecuta ESLint

### Base de Datos
- `npm run db:generate` - Genera el cliente de Prisma
- `npm run db:migrate` - Ejecuta migraciones
- `npm run db:studio` - Abre Prisma Studio
- `npm run db:push` - Sincroniza el esquema con la BD

### Seeding
- `npm run seed:config` - Configuración inicial
- `npm run seed:add-test-data` - Datos de prueba
- `npm run seed:add-payment-methods` - Métodos de pago

## 🔧 Configuración

### Base de Datos
El proyecto soporta SQLite (desarrollo) y PostgreSQL (producción). Cambia la `DATABASE_URL` en `.env.local`:

**SQLite (por defecto):**
```bash
DATABASE_URL="file:./dev.db"
```

**PostgreSQL:**
```bash
DATABASE_URL="postgresql://usuario:password@localhost:5432/sistema_rifas"
```

### Autenticación
Configura las claves JWT en `.env.local`:
```bash
JWT_SECRET="tu-clave-muy-segura-de-al-menos-32-caracteres"
NEXTAUTH_SECRET="otra-clave-segura-para-nextauth"
```

## 📱 Funcionalidades

### Para Usuarios
- 🎯 Visualización de rifas activas
- 🎫 Compra y reserva de boletos
- 💳 Múltiples métodos de pago
- 📱 Interfaz responsive y moderna
- 🔍 Búsqueda y filtrado de rifas

### Para Administradores
- 📊 Dashboard con estadísticas completas
- 🎯 Gestión completa de rifas
- 👥 Administración de usuarios
- 💰 Control de pagos y transacciones
- 📈 Reportes y analytics
- ⚙️ Configuración del sistema

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### VPS/Servidor Propio
```bash
# Construir la aplicación
npm run build

# Iniciar en producción
npm run start
```

## 🤝 Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

Si tienes preguntas o necesitas ayuda:

- 📧 Abre un [Issue](../../issues)
- 💬 Únete a las [Discussions](../../discussions)
- 📖 Lee la [documentación completa](docs/)

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework React
- [Prisma](https://prisma.io/) - ORM moderno
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI

---

⭐ **Si este proyecto te fue útil, considera darle una estrella en GitHub!**

## Características del Admin Panel

- **Dashboard**: Estadísticas en tiempo real con animaciones
- **Gestión de Rifas**: Crear, editar y gestionar rifas
- **Control de Tickets**: Visualizar y gestionar boletos vendidos
- **Usuarios**: Administración completa de usuarios
- **Pagos**: Verificación y gestión de pagos
- **Notificaciones**: Sistema de notificaciones en tiempo real

## Características de Diseño

- **Animaciones Fluidas**: Transiciones y efectos modernos
- **Glassmorphism**: Efectos de vidrio modernos
- **Gradientes**: Colores vibrantes y modernos
- **Responsivo**: Perfecto en móviles y escritorio
- **Dark Theme**: Diseño oscuro profesional

## Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio en Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### VPS/Servidor Propio
1. Usa el archivo ecosystem.config.json para PM2
2. Configura nginx como proxy reverso
3. Usa el script setup-vps.ps1 para automatizar

## Licencia

Este proyecto está bajo la Licencia MIT.

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Soporte

Si encuentras algún bug o tienes sugerencias, por favor abre un issue en GitHub.

---

Desarrollado con ❤️ para crear la mejor experiencia de rifas online.

