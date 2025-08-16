# 🎯 Sistema de Rifas Completo

Un sistema completo de gestión de rifas desarrollado con **Next.js 14**, **TypeScript**, **PostgreSQL** y **Prisma**. Incluye panel de administración, sistema de pagos, sorteos automáticos y más.

## ✨ Características Principales

### 🎫 Sistema de Rifas
- ✅ Creación y gestión de rifas
- ✅ Reserva de tickets en tiempo real
- ✅ Sistema de sorteos aleatorios
- ✅ Verificación de tickets por número o celular
- ✅ Control de disponibilidad automático

### 💰 Gestión de Pagos
- ✅ Carga de comprobantes de pago
- ✅ Verificación manual de pagos
- ✅ Estados de tickets (reservado, pagado, vencido)
- ✅ Múltiples métodos de pago

### 🛡️ Administración y Seguridad
- ✅ Panel de administración completo
- ✅ Autenticación JWT robusta
- ✅ Roles de usuario (Admin, Vendedor)
- ✅ Sistema de auditoría completo
- ✅ Dashboard con estadísticas en tiempo real

### 📱 Interfaz de Usuario
- ✅ Design system con Tailwind CSS
- ✅ Componentes reutilizables con Radix UI
- ✅ Responsive design
- ✅ Notificaciones en tiempo real

## 🚀 Instalación Rápida

### Requisitos Previos
- **Node.js 18+**
- **PostgreSQL** (local o remoto)
- **Git**

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/sistema-rifas.git
cd sistema-rifas
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local

# Editar .env.local con tus configuraciones
# DATABASE_URL, JWT_SECRET, etc.
```

### 4. Configurar la base de datos
```bash
# Aplicar migraciones
npx prisma migrate deploy

# Generar el cliente de Prisma
npx prisma generate

# Opcional: Cargar datos de prueba
npm run db:seed
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Variables de Entorno

Crear un archivo `.env.local` con las siguientes variables:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/sistema_rifas"

# JWT
JWT_SECRET="tu-clave-secreta-jwt-256-bits"
NEXTAUTH_SECRET="tu-clave-nextauth"

# Aplicación
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## 📊 Estructura del Proyecto

```
sistema-rifas/
├── src/
│   ├── app/                    # App Router de Next.js 14
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── admin/         # Panel administrativo
│   │   │   ├── rifas/         # Gestión de rifas
│   │   │   └── tickets/       # Gestión de tickets
│   │   ├── admin/             # Páginas de administración
│   │   └── page.tsx           # Página principal
│   ├── components/            # Componentes reutilizables
│   ├── lib/                   # Utilidades y configuraciones
│   └── types/                 # Tipos de TypeScript
├── prisma/
│   ├── schema.prisma          # Modelo de base de datos
│   ├── migrations/            # Migraciones
│   └── seed.ts               # Datos de prueba
├── public/                    # Assets estáticos
└── scripts/                   # Scripts de utilidad
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Build de producción
npm run start           # Servidor de producción
npm run lint            # Linter

# Base de datos
npm run db:push         # Aplicar cambios al schema
npm run db:studio       # Abrir Prisma Studio
npm run db:generate     # Generar cliente Prisma
npm run db:migrate      # Crear y aplicar migración
npm run db:seed         # Cargar datos de prueba

# Utilidades
npm run db:init         # Inicializar BD de producción
npm run db:optimize     # Optimizar base de datos
npm run db:backup       # Crear backup
```

## 🎯 Funcionalidades Técnicas

### 🏗️ Stack Tecnológico
- **Framework:** Next.js 14 con App Router
- **Lenguaje:** TypeScript
- **Base de Datos:** PostgreSQL con Prisma ORM
- **Autenticación:** JWT personalizado
- **UI:** Tailwind CSS + Radix UI
- **Validación:** Zod
- **Date Management:** date-fns

### 📱 Características de la UI
- Design system consistente
- Componentes accesibles (Radix UI)
- Responsive design mobile-first
- Dark mode support ready
- Toast notifications
- Loading states y feedback visual

### 🔒 Seguridad Implementada
- Autenticación JWT con refresh tokens
- Middleware de protección de rutas
- Validación de inputs con Zod
- Rate limiting (configuración lista)
- Logs de auditoría completos
- Variables de entorno seguras

## 🚀 Deployment

### Opción 1: Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Opción 2: Docker
```bash
# Build de la imagen
docker build -t sistema-rifas .

# Ejecutar
docker run -p 3000:3000 sistema-rifas
```

### Opción 3: VPS/Servidor
Ver documentación en `/scripts/setup-vps.ps1`

## 📈 Performance

- **Bundle size:** 87.1 kB First Load JS
- **Build optimizado:** Tree shaking automático
- **Base de datos:** Queries optimizadas con Prisma
- **Cache:** Next.js cache strategies implementadas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Tu Nombre** - [@tu-usuario](https://github.com/tu-usuario)

## 🆘 Soporte

Si tienes alguna pregunta o necesitas ayuda:

1. Revisa la [documentación](./docs/)
2. Abre un [issue](https://github.com/tu-usuario/sistema-rifas/issues)
3. Contacta al desarrollador

---

### 🌟 ¿Te gusta el proyecto? ¡Dale una estrella en GitHub!

**Made with ❤️ and ☕**
