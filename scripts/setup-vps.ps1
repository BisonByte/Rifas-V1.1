# Script de configuración automática para VPS
# PowerShell para Windows Server o Linux con PowerShell Core

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [string]$Domain = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$InstallDocker = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SetupSSL = $false
)

Write-Host "🚀 Configurando VPS para Sistema de Rifas..." -ForegroundColor Green
Write-Host "🌍 Entorno: $Environment" -ForegroundColor Yellow
Write-Host "🏠 Dominio: $(if($Domain) { $Domain } else { 'No especificado' })" -ForegroundColor Yellow

# Variables globales
$PROJECT_NAME = "sistema-rifas"
$PROJECT_DIR = "/opt/$PROJECT_NAME"
$BACKUP_DIR = "/var/backups/rifas"
$LOG_FILE = "/var/log/rifas-setup.log"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $Message" | Tee-Object -FilePath $LOG_FILE -Append
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

Write-Log "🚀 Iniciando configuración del VPS"

# 1. Verificar sistema operativo
Write-Host "🔍 Verificando sistema operativo..." -ForegroundColor Cyan
$OS = $PSVersionTable.OS
Write-Log "Sistema operativo detectado: $OS"

# 2. Actualizar sistema
Write-Host "🔄 Actualizando sistema..." -ForegroundColor Cyan
if ($IsLinux) {
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y curl wget git unzip htop
} elseif ($IsWindows) {
    Write-Host "⚠️  Windows detectado. Algunas funciones pueden requerir ajustes manuales" -ForegroundColor Yellow
}

# 3. Instalar Node.js y npm
Write-Host "📦 Instalando Node.js..." -ForegroundColor Cyan
if (-not (Test-Command "node")) {
    if ($IsLinux) {
        # Instalar Node.js 20 LTS
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    }
    Write-Log "Node.js instalado: $(node --version)"
} else {
    Write-Host "✅ Node.js ya está instalado: $(node --version)" -ForegroundColor Green
}

# 4. Instalar PM2 para gestión de procesos
Write-Host "⚙️  Instalando PM2..." -ForegroundColor Cyan
if (-not (Test-Command "pm2")) {
    npm install -g pm2
    Write-Log "PM2 instalado: $(pm2 --version)"
} else {
    Write-Host "✅ PM2 ya está instalado" -ForegroundColor Green
}

# 5. Instalar Docker (si se solicita)
if ($InstallDocker) {
    Write-Host "🐳 Instalando Docker..." -ForegroundColor Cyan
    if ($IsLinux -and -not (Test-Command "docker")) {
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        
        # Instalar Docker Compose
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        
        Write-Log "Docker instalado: $(docker --version)"
    } else {
        Write-Host "✅ Docker ya está instalado o no es compatible con este sistema" -ForegroundColor Green
    }
}

# 6. Configurar Nginx
Write-Host "🌐 Configurando Nginx..." -ForegroundColor Cyan
if ($IsLinux) {
    sudo apt install -y nginx
    
    # Configurar Nginx para Next.js
    $nginxConfig = @"
server {
    listen 80;
    server_name $(if($Domain) { $Domain } else { '_ default_server' });
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
}
"@
    
    $nginxConfig | sudo tee "/etc/nginx/sites-available/$PROJECT_NAME" | Out-Null
    sudo ln -sf "/etc/nginx/sites-available/$PROJECT_NAME" "/etc/nginx/sites-enabled/"
    sudo rm -f /etc/nginx/sites-enabled/default
    
    sudo nginx -t && sudo systemctl restart nginx
    Write-Log "Nginx configurado y reiniciado"
}

# 7. Configurar certificados SSL con Let's Encrypt
if ($SetupSSL -and $Domain) {
    Write-Host "🔒 Configurando SSL con Let's Encrypt..." -ForegroundColor Cyan
    if ($IsLinux) {
        sudo apt install -y certbot python3-certbot-nginx
        sudo certbot --nginx -d $Domain --non-interactive --agree-tos --email "admin@$Domain"
        Write-Log "SSL configurado para dominio: $Domain"
    }
}

# 8. Configurar firewall
Write-Host "🔥 Configurando firewall..." -ForegroundColor Cyan
if ($IsLinux -and (Test-Command "ufw")) {
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
    Write-Log "Firewall configurado"
}

# 9. Crear estructura de directorios
Write-Host "📁 Creando estructura de directorios..." -ForegroundColor Cyan
$directories = @($PROJECT_DIR, $BACKUP_DIR, "/var/log/rifas")
foreach ($dir in $directories) {
    if ($IsLinux) {
        sudo mkdir -p $dir
        Write-Log "Directorio creado: $dir"
    }
}

# 10. Configurar variables de entorno de producción
Write-Host "🔐 Configurando variables de entorno..." -ForegroundColor Cyan
$envContent = @"
# Configuración de producción
NODE_ENV=production
PORT=3000

# Base de datos PostgreSQL
DATABASE_URL="postgresql://rifas_user:rifas_password_2024@localhost:5432/sistema_rifas?schema=public"

# JWT y seguridad
JWT_SECRET="$(Get-Random -Count 32 | ForEach-Object { '{0:X2}' -f $_ })"
NEXTAUTH_SECRET="$(Get-Random -Count 32 | ForEach-Object { '{0:X2}' -f $_ })"
NEXTAUTH_URL="$(if($Domain) { "https://$Domain" } else { 'http://localhost:3000' })"

# Configuración de la aplicación
TIEMPO_RESERVA_DEFAULT=30
MAX_NUMEROS_POR_PERSONA=10
MONEDA_DEFAULT=EUR
ZONA_HORARIA_DEFAULT=Europe/Madrid

# Configuración de backup
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30

# Configuración de logs
LOG_LEVEL=info
LOG_FILE_ENABLED=true
"@

$envContent | Out-File -FilePath "$PROJECT_DIR/.env.production" -Encoding UTF8
Write-Log "Variables de entorno configuradas"

# 11. Configurar PM2
Write-Host "⚙️  Configurando PM2..." -ForegroundColor Cyan
$pm2Config = @"
{
  "apps": [{
    "name": "$PROJECT_NAME",
    "script": "npm",
    "args": "start",
    "cwd": "$PROJECT_DIR",
    "env": {
      "NODE_ENV": "production",
      "PORT": "3000"
    },
    "instances": "max",
    "exec_mode": "cluster",
    "watch": false,
    "max_memory_restart": "1G",
    "error_file": "/var/log/rifas/error.log",
    "out_file": "/var/log/rifas/access.log",
    "log_file": "/var/log/rifas/combined.log",
    "time": true,
    "restart_delay": 4000,
    "max_restarts": 10,
    "min_uptime": "10s"
  }]
}
"@

$pm2Config | Out-File -FilePath "$PROJECT_DIR/ecosystem.config.json" -Encoding UTF8
Write-Log "Configuración de PM2 creada"

# 12. Configurar cron jobs para mantenimiento
Write-Host "⏰ Configurando tareas programadas..." -ForegroundColor Cyan
if ($IsLinux) {
    $cronJobs = @"
# Backup diario a las 2:00 AM
0 2 * * * /opt/$PROJECT_NAME/scripts/backup-database.sh full >> /var/log/rifas/backup.log 2>&1

# Optimización semanal los domingos a las 3:00 AM
0 3 * * 0 cd /opt/$PROJECT_NAME && npm run db:optimize >> /var/log/rifas/maintenance.log 2>&1

# Limpieza de logs mensual
0 4 1 * * find /var/log/rifas -name "*.log" -mtime +30 -delete
"@
    
    $cronJobs | sudo tee -a /etc/crontab | Out-Null
    Write-Log "Tareas programadas configuradas"
}

# 13. Crear script de deploy
Write-Host "🚀 Creando script de deploy..." -ForegroundColor Cyan
$deployScript = @"
#!/bin/bash
# Script de deploy automatizado

set -e
cd $PROJECT_DIR

echo "📦 Descargando código..."
git pull origin main

echo "📦 Instalando dependencias..."
npm ci --production

echo "🏗️  Construyendo aplicación..."
npm run build

echo "🔄 Reiniciando aplicación..."
pm2 restart $PROJECT_NAME

echo "✅ Deploy completado!"
"@

$deployScript | Out-File -FilePath "$PROJECT_DIR/deploy.sh" -Encoding UTF8
if ($IsLinux) {
    chmod +x "$PROJECT_DIR/deploy.sh"
}
Write-Log "Script de deploy creado"

# 14. Mostrar resumen
Write-Host "`n🎉 Configuración del VPS completada!" -ForegroundColor Green
Write-Host "`n📋 Resumen de la configuración:" -ForegroundColor Yellow
Write-Host "  🏠 Directorio del proyecto: $PROJECT_DIR"
Write-Host "  💾 Directorio de backups: $BACKUP_DIR"
Write-Host "  📄 Archivo de logs: $LOG_FILE"
Write-Host "  🌐 Puerto de la aplicación: 3000"
Write-Host "  🔒 SSL configurado: $(if($SetupSSL) { 'Sí' } else { 'No' })"
Write-Host "  🐳 Docker instalado: $(if($InstallDocker) { 'Sí' } else { 'No' })"

Write-Host "`n📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Clonar el repositorio en $PROJECT_DIR"
Write-Host "  2. Configurar la base de datos PostgreSQL"
Write-Host "  3. Ejecutar 'npm install' y 'npm run build'"
Write-Host "  4. Inicializar la base de datos con 'npm run db:init'"
Write-Host "  5. Iniciar la aplicación con 'pm2 start ecosystem.config.json'"

if ($Domain) {
    Write-Host "`n🌐 Tu aplicación estará disponible en: https://$Domain" -ForegroundColor Green
} else {
    Write-Host "`n🌐 Tu aplicación estará disponible en: http://tu-ip-del-vps" -ForegroundColor Green
}

Write-Host "`n⚠️  Recuerda:" -ForegroundColor Yellow
Write-Host "  - Cambiar las credenciales por defecto"
Write-Host "  - Configurar copias de seguridad automáticas"
Write-Host "  - Monitorear los logs en /var/log/rifas/"
Write-Host "  - Actualizar regularmente el sistema y dependencias"

Write-Log "🎉 Configuración del VPS completada exitosamente"
