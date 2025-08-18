# Contribuir al Sistema de Rifas

¡Gracias por tu interés en contribuir! Aquí tienes las pautas para contribuir de manera efectiva.

## ⚡ Resumen Rápido

### 🚀 Primeros Pasos (5 minutos)

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/tu-usuario/sistema-rifas.git
cd sistema-rifas
npm install

# 2. Configurar entorno
cp .env.example .env.local

# 3. Configurar base de datos
npm run db:switch-sqlite      # Para desarrollo local
npx prisma generate
npx prisma db push

# 4. Inicializar datos (opcional)
npm run seed:config
npm run seed:add-test-data

# 5. ¡Listo! Iniciar desarrollo
npm run dev                   # http://localhost:3000
```

### 🔧 Scripts de Desarrollo

```bash
# Base de datos
npm run db:status             # Ver configuración actual
npm run db:switch-postgres    # Cambiar a PostgreSQL
npm run db:studio             # Interfaz visual de BD

# Calidad de código
npm run lint                  # Verificar código
npm test                      # Ejecutar tests
npm run test:coverage         # Cobertura de tests

# Build y deploy
npm run build                 # Construir para producción
npm start                     # Ejecutar versión de producción
```

### 📋 Checklist para Pull Requests

- [ ] Fork del repositorio y rama desde `main`
- [ ] Código sigue las [convenciones de estilo](#estilo-de-código)
- [ ] Tests pasan: `npm test`
- [ ] Sin errores de lint: `npm run lint`
- [ ] Commits siguen [formato convencional](#commits)
- [ ] Documentación actualizada si es necesario

> 📖 **¿Necesitas más detalles?** 
> - [Configuración del Entorno](#configuración-del-entorno) - Setup detallado paso a paso
> - [Estilo de Código](#estilo-de-código) - Convenciones de TypeScript y ESLint  
> - [Estructura de Branches](#estructura-de-branches) - Flujo de trabajo con Git
> - [Tests](#tests) - Cómo escribir y ejecutar pruebas
> - [Proceso de Review](#proceso-de-review) - Requisitos para Pull Requests

---

## 📚 Tabla de Contenidos

1. [⚡ Resumen Rápido](#-resumen-rápido)
2. [🤝 ¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
3. [🛠️ Guías de Desarrollo](#guías-de-desarrollo)
4. [🧪 Tests](#tests)
5. [📖 Documentación](#documentación)
6. [👀 Proceso de Review](#proceso-de-review)

## Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código.

## 🤝 ¿Cómo puedo contribuir?

### Reportar Bugs

- Usa el issue tracker de GitHub
- Describe claramente el problema
- Incluye pasos para reproducir el bug
- Menciona tu sistema operativo y versión de Node.js

### Sugerir Funcionalidades

- Abre un issue describiendo la funcionalidad
- Explica por qué sería útil
- Considera las implicaciones de la implementación

### Pull Requests

1. Fork el repositorio
2. Crea una rama desde main: `git checkout -b feature/nueva-funcionalidad`
3. Haz tus cambios y commit con mensajes descriptivos
4. Asegúrate de que los tests pasen
5. Push a tu fork: `git push origin feature/nueva-funcionalidad`
6. Abre un Pull Request

## 🛠️ Guías de Desarrollo

### Configuración del Entorno

```bash
git clone https://github.com/tu-usuario/sistema-rifas.git
cd sistema-rifas
npm install
cp .env.example .env.local
npm run dev
```

### Estilo de Código

- Usamos TypeScript
- Seguimos las reglas de ESLint
- Usa Prettier para formatear
- Nombra las variables y funciones de manera descriptiva

### Commits

Usa el formato convencional de commits:

```
feat: añade nueva funcionalidad
fix: corrige bug en autenticación
docs: actualiza README
style: mejora estilos del admin panel
refactor: reestructura componentes
test: añade tests para API
```

### Estructura de Branches

- `main`: código de producción
- `develop`: desarrollo activo
- `feature/nombre`: nuevas funcionalidades
- `fix/nombre`: correcciones de bugs
- `hotfix/nombre`: correcciones urgentes

## 🧪 Tests

- Escribe tests para funcionalidades nuevas
- Asegúrate de que todos los tests pasen
- Mantén una cobertura de código alta

```bash
npm test
npm run test:coverage
```

## 📖 Documentación

- Actualiza la documentación cuando sea necesario
- Incluye comentarios en código complejo
- Mantén el README actualizado

## 👀 Proceso de Review

1. Al menos un reviewer debe aprobar el PR
2. Todos los checks de CI deben pasar
3. No debe haber conflictos de merge
4. El código debe seguir las guías de estilo

## Preguntas

Si tienes preguntas, puedes:
- Abrir un issue
- Contactar a los maintainers
- Unirte a las discusiones

¡Gracias por contribuir!
