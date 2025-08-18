#!/bin/bash

# Script de backup automatizado para PostgreSQL
# Uso: ./backup-database.sh [full|schema-only|data-only]

set -e  # Salir si hay errores

# Configuración
BACKUP_DIR="/var/backups/rifas"
DATE=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=30

# Variables de entorno (deben estar configuradas)
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"sistema_rifas"}
DB_USER=${DB_USER:-"rifas_user"}

BACKUP_TYPE=${1:-"full"}
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${DATE}.sql"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Función para logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Crear directorio de backup si no existe
mkdir -p "$BACKUP_DIR"

log "🚀 Iniciando backup de base de datos: $DB_NAME"
log "📁 Directorio de backup: $BACKUP_DIR"
log "📄 Archivo de backup: $BACKUP_FILE"
log "🔧 Tipo de backup: $BACKUP_TYPE"

# Verificar conectividad
log "🔍 Verificando conectividad a la base de datos..."
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" > /dev/null 2>&1; then
    log "❌ Error: No se puede conectar a la base de datos"
    exit 1
fi
log "✅ Conexión exitosa"

# Realizar backup según el tipo
case $BACKUP_TYPE in
    "full")
        log "💾 Realizando backup completo (schema + datos)..."
        pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
                --verbose --clean --no-owner --no-privileges \
                --format=plain > "$BACKUP_FILE"
        ;;
    "schema-only")
        log "🏗️  Realizando backup de schema únicamente..."
        pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
                --verbose --clean --no-owner --no-privileges \
                --schema-only --format=plain > "$BACKUP_FILE"
        ;;
    "data-only")
        log "📊 Realizando backup de datos únicamente..."
        pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
                --verbose --no-owner --no-privileges \
                --data-only --format=plain > "$BACKUP_FILE"
        ;;
    *)
        log "❌ Tipo de backup inválido: $BACKUP_TYPE"
        log "   Tipos válidos: full, schema-only, data-only"
        exit 1
        ;;
esac

# Verificar que el backup se creó correctamente
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "✅ Backup completado exitosamente"
    log "📏 Tamaño del archivo: $BACKUP_SIZE"
    
    # Comprimir el backup
    log "🗜️  Comprimiendo backup..."
    gzip "$BACKUP_FILE"
    COMPRESSED_FILE="${BACKUP_FILE}.gz"
    COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    log "✅ Compresión completada: $COMPRESSED_SIZE"
    
    # Verificar integridad del archivo comprimido
    if gzip -t "$COMPRESSED_FILE" 2>/dev/null; then
        log "✅ Integridad del archivo comprimido verificada"
    else
        log "⚠️  Advertencia: El archivo comprimido podría estar corrupto"
    fi
else
    log "❌ Error: El backup no se pudo crear o está vacío"
    exit 1
fi

# Limpieza de backups antiguos
log "🧹 Limpiando backups antiguos (más de $RETENTION_DAYS días)..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
log "🗑️  Backups eliminados: $DELETED_COUNT archivos"

# Listar backups disponibles
log "📋 Backups disponibles:"
ls -lh "$BACKUP_DIR"/backup_${DB_NAME}_*.sql.gz | tail -5 | while read line; do
    log "   $line"
done

# Estadísticas finales
TOTAL_BACKUPS=$(ls -1 "$BACKUP_DIR"/backup_${DB_NAME}_*.sql.gz 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

log "📊 Estadísticas finales:"
log "   💾 Total de backups: $TOTAL_BACKUPS"
log "   📏 Espacio total usado: $TOTAL_SIZE"

log "🎉 Proceso de backup completado exitosamente"

# Si se ejecuta en un cron, enviar notificación (opcional)
if [ "$SEND_NOTIFICATION" = "true" ]; then
    # Aquí podrías agregar notificación por email, Slack, etc.
    log "📧 Enviando notificación de backup completado..."
fi

exit 0
