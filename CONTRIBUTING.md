# Contribuir al Sistema de Rifas

¡Gracias por tu interés en contribuir! Aquí tienes las pautas para contribuir de manera efectiva.

## Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código.

## ¿Cómo puedo contribuir?

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
2. Crea una rama desde main: git checkout -b feature/nueva-funcionalidad
3. Haz tus cambios y commit con mensajes descriptivos
4. Asegúrate de que los tests pasen
5. Push a tu fork: git push origin feature/nueva-funcionalidad
6. Abre un Pull Request

## Guías de Desarrollo

### Configuración del Entorno

`ash
git clone https://github.com/tu-usuario/sistema-rifas.git
cd sistema-rifas
npm install
cp .env.example .env.local
npm run dev
`

### Estilo de Código

- Usamos TypeScript
- Seguimos las reglas de ESLint
- Usa Prettier para formatear
- Nombra las variables y funciones de manera descriptiva

### Commits

Usa el formato convencional de commits:

`
feat: añade nueva funcionalidad
fix: corrige bug en autenticación
docs: actualiza README
style: mejora estilos del admin panel
refactor: reestructura componentes
test: añade tests para API
`

### Estructura de Branches

- main: código de producción
- develop: desarrollo activo
- eature/nombre: nuevas funcionalidades
- ix/nombre: correcciones de bugs
- hotfix/nombre: correcciones urgentes

## Tests

- Escribe tests para funcionalidades nuevas
- Asegúrate de que todos los tests pasen
- Mantén una cobertura de código alta

`ash
npm test
npm run test:coverage
`

## Documentación

- Actualiza la documentación cuando sea necesario
- Incluye comentarios en código complejo
- Mantén el README actualizado

## Proceso de Review

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
