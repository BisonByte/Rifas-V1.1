# Política de Seguridad

## Versiones Soportadas

Actualmente estamos dando soporte de seguridad a las siguientes versiones:

| Versión | Soportada          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reportar una Vulnerabilidad

Si descubres una vulnerabilidad de seguridad en este proyecto, por favor no la reportes públicamente. En su lugar, sigue estos pasos:

### Proceso de Reporte

1. **Email**: Envía un email a [tu-email-de-seguridad@example.com] con los detalles de la vulnerabilidad
2. **Incluye**: Una descripción detallada de la vulnerabilidad y pasos para reproducirla
3. **Tiempo de Respuesta**: Responderemos dentro de 48 horas
4. **Confidencialidad**: Mantendremos la información confidencial hasta que se resuelva

### Información a Incluir

Para ayudarnos a entender y resolver el issue más rápido, incluye la siguiente información:

- Tipo de issue (ej. buffer overflow, SQL injection, cross-site scripting, etc.)
- Ubicación del código fuente relacionado con la manifestación del issue
- Cualquier configuración especial requerida para reproducir el issue
- Instrucciones paso a paso para reproducir el issue
- Proof-of-concept o código de exploit (si es posible)
- Impacto potencial del issue, incluyendo cómo un atacante podría explotar el issue

### Reconocimiento

- Te daremos crédito por el descubrimiento responsable (a menos que prefieras permanecer anónimo)
- Una vez solucionado, añadiremos la información al CHANGELOG

## Mejores Prácticas de Seguridad

### Para Usuarios

1. **Variables de Entorno**: Nunca hagas commit de archivos `.env` con datos sensibles
2. **JWT Secrets**: Usa claves seguras y largas para JWT_SECRET (mínimo 32 caracteres)
3. **Base de Datos**: Usa credenciales fuertes para la base de datos en producción
4. **HTTPS**: Siempre usa HTTPS en producción
5. **Actualizaciones**: Mantén las dependencias actualizadas

### Para Desarrolladores

1. **Validación**: Valida siempre la entrada del usuario
2. **Sanitización**: Sanitiza datos antes de almacenarlos en la base de datos
3. **Autenticación**: Verifica permisos en todas las rutas protegidas
4. **Rate Limiting**: Implementa rate limiting en endpoints sensibles
5. **Logging**: Registra eventos de seguridad importantes

## Configuración de Seguridad Recomendada

### Variables de Entorno de Producción

```bash
# Usa claves seguras y únicas para producción
JWT_SECRET="clave-muy-segura-de-al-menos-32-caracteres-aleatorios"
NEXTAUTH_SECRET="otra-clave-diferente-y-segura"

# Usa HTTPS en producción
NEXTAUTH_URL="https://tu-dominio.com"
NEXT_PUBLIC_BASE_URL="https://tu-dominio.com"

# Credenciales de base de datos seguras
DATABASE_URL="postgresql://usuario_seguro:password_muy_segura@host:5432/db_name"
```

### Headers de Seguridad

El proyecto incluye configuración de headers de seguridad en `next.config.js`. Asegúrate de mantenerlos habilitados.

## Contacto

Para preguntas relacionadas con seguridad que no son vulnerabilidades, puedes:

- Abrir un issue en el repositorio etiquetado como "security"
- Contactarnos por email

Tomamos la seguridad en serio y apreciamos tu ayuda para mantener este proyecto seguro.
