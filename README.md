# Sistema de Rifas Profesional

Un sistema completo de rifas desarrollado con Next.js 14, Prisma y TypeScript, diseñado para gestionar rifas de manera profesional con una interfaz moderna y animaciones fluidas.

## Características

- **Diseño Moderno**: Interfaz profesional con efectos glassmorphism y animaciones fluidas
- **Sistema de Autenticación**: Login seguro para administradores con JWT
- **Panel de Administración**: Dashboard completo con estadísticas y gestión
- **Gestión de Tickets**: Sistema completo de reserva y venta de boletos
- **Pagos Integrados**: Gestión de métodos de pago y verificación
- **Responsive**: Diseño adaptado para móviles y escritorio
- **Performance**: Optimizado con Next.js 14 y App Router

## Tecnologías

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes
- **Base de Datos**: Prisma ORM (SQLite/PostgreSQL)
- **Autenticación**: JWT
- **UI Components**: shadcn/ui

## Instalación

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/sistema-rifas.git
cd sistema-rifas
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus configuraciones:
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-jwt-secret-muy-seguro"
NEXTAUTH_SECRET="tu-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Configurar la base de datos**
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en http://localhost:3000

## Estructura del Proyecto
```bash
src/
   app/                    # App Router de Next.js
      admin/             # Panel de administración
      api/               # API Routes
      globals.css        # Estilos globales
   components/            # Componentes reutilizables
      ui/               # Componentes base
      landing/          # Componentes de landing
      analytics/        # Componentes de estadísticas
   lib/                   # Utilidades y configuraciones
   types/                 # Tipos de TypeScript
prisma/                    # Schema y migraciones
public/                    # Archivos estáticos
scripts/                   # Scripts de utilidad
```

## Scripts Disponibles
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run db:reset     # Reset de base de datos
npm run db:seed      # Poblar base de datos
```

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

