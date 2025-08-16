# Prueba manual: redirección de /admin sin sesión

Esta prueba verifica que los usuarios sin autenticación no puedan acceder al panel administrativo.

1. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
2. Abre `http://localhost:3000/admin` en una ventana de incógnito o un navegador sin cookies de sesión.
3. Deberías ser redirigido automáticamente a `/admin/login`.

Si la página de login aparece, la redirección funciona correctamente.
