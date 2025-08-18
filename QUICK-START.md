# 🚀 Setup Rápido - Sistema de Rifas

## ⚡ Instalación en 5 minutos

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
cp .env.example .env.local
```

Edita `.env.local` con tus datos:
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-clave-super-segura-de-32-caracteres"
NEXTAUTH_SECRET="otra-clave-diferente-para-nextauth"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Configurar base de datos
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed:config
npm run seed:add-test-data
```

### 5. Iniciar el proyecto
```bash
npm run dev
```

¡Listo! 🎉 Ve a http://localhost:3000

## 🔑 Credenciales por defecto

**Admin:**
- Usuario: `admin@rifas.com`
- Password: `admin123`

## 📚 Documentación Completa

- [README.md](README.md) - Documentación completa
- [CONTRIBUTING.md](CONTRIBUTING.md) - Guía para contribuir
- [DEPLOY-INSTRUCTIONS.md](DEPLOY-INSTRUCTIONS.md) - Instrucciones de despliegue

## 🆘 ¿Problemas?

1. Asegúrate de tener Node.js 18+
2. Elimina `node_modules` y ejecuta `npm install` nuevamente
3. Verifica que las variables de entorno estén configuradas
4. Abre un [issue](../../issues) si persiste el problema
