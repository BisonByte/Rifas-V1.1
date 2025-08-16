# 🚀 Guía de Despliegue en Producción - VPS

Esta guía te llevará paso a paso para desplegar el Sistema de Rifas en un VPS de producción.

## 📋 Tabla de Contenidos

1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Preparación del VPS](#preparación-del-vps)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Despliegue de la Aplicación](#despliegue-de-la-aplicación)
5. [Configuración de Nginx](#configuración-de-nginx)
6. [SSL con Let's Encrypt](#ssl-con-lets-encrypt)
7. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
8. [Backup y Restauración](#backup-y-restauración)
9. [Troubleshooting](#troubleshooting)

## 🔧 Requisitos del Sistema

### Especificaciones Mínimas del VPS
- **CPU**: 2 vCPU
- **RAM**: 4 GB
- **Almacenamiento**: 50 GB SSD
- **SO**: Ubuntu 20.04 LTS / 22.04 LTS
- **Ancho de banda**: 100 Mbps

### Especificaciones Recomendadas
- **CPU**: 4 vCPU
- **RAM**: 8 GB
- **Almacenamiento**: 100 GB SSD
- **SO**: Ubuntu 22.04 LTS
- **Ancho de banda**: 1 Gbps

## 🏗️ Preparación del VPS

### 1. Configuración Inicial

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar herramientas esenciales
sudo apt install -y curl wget git unzip htop ufw fail2ban

# Configurar timezone
sudo timedatectl set-timezone Europe/Madrid
```

### 2. Configurar Usuario de Aplicación

```bash
# Crear usuario para la aplicación
sudo adduser rifas --disabled-password --gecos ""
sudo usermod -aG sudo rifas
sudo su - rifas
```

### 3. Configurar Firewall

```bash
# Configurar UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 🗄️ Configuración de Base de Datos

### Opción 1: PostgreSQL con Docker (Recomendado)

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker rifas

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Crear directorio del proyecto
sudo mkdir -p /opt/sistema-rifas
sudo chown rifas:rifas /opt/sistema-rifas
cd /opt/sistema-rifas

# Clonar el repositorio (reemplaza con tu repositorio)
git clone https://github.com/tuusuario/sistema-rifas.git .

# Iniciar PostgreSQL con Docker
docker-compose up -d postgres pgadmin
```

### Opción 2: PostgreSQL Nativo

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Configurar base de datos
sudo -u postgres psql << 'EOF'
CREATE DATABASE sistema_rifas;
CREATE USER rifas_user WITH PASSWORD 'rifas_password_2024';
GRANT ALL PRIVILEGES ON DATABASE sistema_rifas TO rifas_user;
ALTER USER rifas_user CREATEDB;
\q
EOF
```

## 🚀 Despliegue de la Aplicación

### 1. Instalar Node.js

```bash
# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 2. Configurar la Aplicación

```bash
cd /opt/sistema-rifas

# Instalar dependencias
npm ci --production

# Configurar variables de entorno
cp .env.example .env.production
nano .env.production
```

**Configuración de `.env.production`:**

```env
NODE_ENV=production
PORT=3000

# Base de datos
DATABASE_URL="postgresql://rifas_user:rifas_password_2024@localhost:5432/sistema_rifas?schema=public"

# JWT y seguridad
JWT_SECRET="tu-jwt-secret-super-seguro-aqui"
NEXTAUTH_SECRET="tu-nextauth-secret-aqui"
NEXTAUTH_URL="https://tudominio.com"

# Configuración de la aplicación
TIEMPO_RESERVA_DEFAULT=30
MAX_NUMEROS_POR_PERSONA=10
```

### 3. Inicializar Base de Datos

```bash
# Generar cliente de Prisma
npx prisma generate

# Crear estructura de base de datos
npx prisma db push

# Inicializar datos de producción
npm run db:init
```

### 4. Construir la Aplicación

```bash
# Construir aplicación para producción
npm run build
```

## 🔄 Gestión de Procesos con PM2

### 1. Instalar PM2

```bash
npm install -g pm2
```

### 2. Configurar PM2

```bash
# Iniciar aplicación
pm2 start ecosystem.config.json

# Configurar PM2 para inicio automático
pm2 startup
pm2 save
```

### 3. Comandos Útiles de PM2

```bash
# Ver estado de la aplicación
pm2 status

# Ver logs
pm2 logs sistema-rifas

# Reiniciar aplicación
pm2 restart sistema-rifas

# Parar aplicación
pm2 stop sistema-rifas

# Monitorear recursos
pm2 monit
```

## 🌐 Configuración de Nginx

### 1. Instalar Nginx

```bash
sudo apt install -y nginx
```

### 2. Configurar Nginx para Next.js

```bash
sudo nano /etc/nginx/sites-available/sistema-rifas
```

**Configuración completa:**

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    
    # Redirección a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;
    
    # SSL Configuration (será configurado por Certbot)
    # ssl_certificate /path/to/certificate;
    # ssl_certificate_key /path/to/private/key;
    
    # Configuración de seguridad SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Headers de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Configuración para archivos estáticos
    location /_next/static/ {
        alias /opt/sistema-rifas/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /images/ {
        alias /opt/sistema-rifas/public/images/;
        expires 1m;
        add_header Cache-Control "public";
    }
    
    # Proxy para la aplicación Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Configuración específica para APIs
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting para APIs
        limit_req zone=api burst=20 nodelay;
    }
    
    # Rate limiting configuration
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    # Client max body size para uploads
    client_max_body_size 10M;
}
```

### 3. Activar Configuración

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/sistema-rifas /etc/nginx/sites-enabled/

# Desactivar sitio por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 🔒 SSL con Let's Encrypt

### 1. Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtener Certificado

```bash
# Obtener certificado SSL
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

## 📊 Monitoreo y Mantenimiento

### 1. Configurar Logs

```bash
# Crear directorio de logs
sudo mkdir -p /var/log/rifas
sudo chown rifas:rifas /var/log/rifas

# Rotar logs con logrotate
sudo nano /etc/logrotate.d/rifas
```

**Configuración de logrotate:**

```
/var/log/rifas/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 rifas rifas
    postrotate
        pm2 reload sistema-rifas
    endscript
}
```

### 2. Monitoreo de Sistema

```bash
# Instalar herramientas de monitoreo
sudo apt install -y htop iotop nethogs

# Script de monitoreo básico
cat > /opt/sistema-rifas/scripts/health-check.sh << 'EOF'
#!/bin/bash
# Health check script

echo "=== System Health Check - $(date) ==="

echo "🖥️  CPU Usage:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}'

echo "💾 Memory Usage:"
free -h

echo "💽 Disk Usage:"
df -h /

echo "🌐 Network Connections:"
ss -tuln | grep :3000

echo "🔄 PM2 Status:"
pm2 status

echo "🗄️  Database Connections:"
psql $DATABASE_URL -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';"

echo "================================"
EOF

chmod +x /opt/sistema-rifas/scripts/health-check.sh
```

### 3. Tareas Programadas (Cron)

```bash
# Editar crontab
crontab -e
```

**Agregar tareas:**

```cron
# Backup diario a las 2:00 AM
0 2 * * * /opt/sistema-rifas/scripts/backup-database.sh full >> /var/log/rifas/backup.log 2>&1

# Health check cada 5 minutos
*/5 * * * * /opt/sistema-rifas/scripts/health-check.sh >> /var/log/rifas/health.log 2>&1

# Optimización de DB semanal (domingos 3:00 AM)
0 3 * * 0 cd /opt/sistema-rifas && npm run db:optimize >> /var/log/rifas/maintenance.log 2>&1

# Limpiar logs antiguos mensualmente
0 4 1 * * find /var/log/rifas -name "*.log" -mtime +30 -delete
```

## 💾 Backup y Restauración

### 1. Backup Automático

El script `backup-database.sh` ya está configurado. Para ejecutar backup manual:

```bash
# Backup completo
/opt/sistema-rifas/scripts/backup-database.sh full

# Solo schema
/opt/sistema-rifas/scripts/backup-database.sh schema-only

# Solo datos
/opt/sistema-rifas/scripts/backup-database.sh data-only
```

### 2. Restaurar Backup

```bash
# Restaurar desde backup
gunzip -c /var/backups/rifas/backup_sistema_rifas_20241201_020000.sql.gz | psql $DATABASE_URL
```

### 3. Backup de Archivos

```bash
# Backup completo del proyecto
tar -czf /var/backups/rifas/proyecto_$(date +%Y%m%d).tar.gz /opt/sistema-rifas --exclude=node_modules --exclude=.next
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. La aplicación no inicia

```bash
# Verificar logs de PM2
pm2 logs sistema-rifas

# Verificar variables de entorno
pm2 env 0

# Reiniciar desde cero
pm2 delete sistema-rifas
pm2 start ecosystem.config.json
```

#### 2. Error de conexión a base de datos

```bash
# Verificar estado de PostgreSQL
sudo systemctl status postgresql

# Verificar conectividad
psql $DATABASE_URL -c "SELECT 1;"

# Verificar logs de PostgreSQL
sudo journalctl -u postgresql -f
```

#### 3. Error 502 Bad Gateway

```bash
# Verificar estado de Nginx
sudo systemctl status nginx

# Verificar configuración de Nginx
sudo nginx -t

# Verificar que la aplicación esté corriendo en puerto 3000
netstat -tlnp | grep 3000
```

#### 4. SSL no funciona

```bash
# Verificar certificados
sudo certbot certificates

# Renovar certificados
sudo certbot renew

# Verificar configuración SSL
sudo nginx -t
```

### Comandos Útiles de Diagnóstico

```bash
# Ver procesos de la aplicación
ps aux | grep node

# Ver uso de recursos
htop

# Ver logs del sistema
journalctl -f

# Ver conexiones de red
netstat -tulpn

# Verificar espacio en disco
df -h

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

## 🚀 Script de Deploy Automatizado

```bash
# Crear script de deploy
cat > /opt/sistema-rifas/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Iniciando deploy..."

# Backup antes del deploy
echo "📦 Creando backup..."
./scripts/backup-database.sh full

# Actualizar código
echo "📥 Descargando código..."
git pull origin main

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci --production

# Ejecutar migraciones si es necesario
echo "🗄️  Verificando migraciones..."
npx prisma db push

# Construir aplicación
echo "🔨 Construyendo aplicación..."
npm run build

# Reiniciar aplicación
echo "🔄 Reiniciando aplicación..."
pm2 restart sistema-rifas

echo "✅ Deploy completado!"
EOF

chmod +x /opt/sistema-rifas/deploy.sh
```

## ✅ Checklist Post-Instalación

- [ ] VPS configurado y actualizado
- [ ] PostgreSQL instalado y configurado
- [ ] Node.js y PM2 instalados
- [ ] Aplicación desplegada y funcionando
- [ ] Nginx configurado como reverse proxy
- [ ] SSL configurado con Let's Encrypt
- [ ] Firewall configurado
- [ ] Backups automáticos programados
- [ ] Monitoreo configurado
- [ ] Logs rotados automáticamente
- [ ] Credenciales por defecto cambiadas
- [ ] Dominio apuntando al VPS
- [ ] Health checks funcionando

## 📞 Soporte y Mantenimiento

### Contactos de Emergencia
- **Administrador del Sistema**: admin@tudominio.com
- **Soporte Técnico**: soporte@tudominio.com

### Mantenimiento Programado
- **Actualizaciones de seguridad**: Primer domingo de cada mes
- **Backup completo**: Diariamente a las 2:00 AM
- **Optimización de DB**: Domingos a las 3:00 AM
- **Revisión de logs**: Semanalmente

### Métricas a Monitorear
- Tiempo de respuesta de la aplicación
- Uso de CPU y memoria
- Espacio en disco
- Conexiones de base de datos activas
- Tasa de errores
- Disponibilidad del servicio

---

**¡Tu Sistema de Rifas está listo para producción!** 🎉

Para cualquier duda o problema, consulta la sección de troubleshooting o contacta al equipo de soporte.
