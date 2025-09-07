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

## Migración a MySQL/MariaDB o PostgreSQL

En el directorio `prisma/` se incluyen archivos SQL que replican el esquema definido en `schema.prisma`:

- `schema.mysql.sql` para bases de datos MySQL o MariaDB.
- `schema.postgres.sql` para bases de datos PostgreSQL.

Estos archivos pueden importarse directamente desde cPanel u otro panel de control para preparar la base de datos sin necesidad de Prisma.

### Uso desde PHP

Si el proyecto se despliega en un entorno PHP, el directorio `php/` contiene un pequeño envoltorio basado en PDO que expone una conexión similar a `src/lib/prisma.ts`:

```php
require __DIR__ . '/php/Database.php';
$db = Database::getInstance()->getConnection();
$usuarios = $db->query('SELECT * FROM usuarios')->fetchAll();
```

Ajusta las variables de entorno `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` o `DATABASE_URL` según tus credenciales.

## cPanel Deployment

1. **Subir archivos PHP**: Utiliza el Administrador de archivos o FTP de cPanel para cargar el contenido del proyecto, en especial el directorio `php/` y los archivos públicos, dentro de `public_html` o la carpeta raíz del dominio.
2. **Importar el esquema SQL**: En phpMyAdmin crea la base de datos e importa el archivo correspondiente desde `prisma/` (`schema.mysql.sql` o `schema.postgres.sql`).
3. **Configurar variables de entorno**: Copia `.env.example` a `.env` y edita las variables como `DB_HOST`, `DB_NAME`, `DB_USER` y `DB_PASS` con las credenciales de tu servidor.
4. **Permisos de archivos**: Asegúrate de que los archivos tengan permisos `644` y los directorios `755` para que el servidor pueda leerlos; ajusta permisos de escritura en directorios que lo requieran.
