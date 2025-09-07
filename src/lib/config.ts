let DB_CONFIG: Record<string, string> = {}

type PrismaLike = {
  configuracionSitio: {
    findMany: () => Promise<Array<{ clave: string; valor: string }>>
  }
}

export const initConfig = async (client?: PrismaLike) => {
  if (typeof window !== 'undefined') return
  try {
    const prisma = client ?? (await import('@/lib/prisma')).prisma
    const dbConfigEntries = await prisma.configuracionSitio.findMany()
    DB_CONFIG = dbConfigEntries.reduce((acc, item) => {
      acc[item.clave] = item.valor
      return acc
    }, {} as Record<string, string>)
  } catch {
    DB_CONFIG = {}
  }
}

const getConfigValueSync = (key: string) => DB_CONFIG[key] ?? process.env[key]

export const getConfigValue = async (key: string, forceRefresh = false) => {
  if (
    typeof window === 'undefined' &&
    (forceRefresh || Object.keys(DB_CONFIG).length === 0)
  ) {
    await initConfig()
  }
  return getConfigValueSync(key)
}

// Configuración centralizada del sistema de rifas
export const CONFIG = {
  // Configuración de tickets
  TICKETS: {
    MIN_RESERVA_MINUTOS: 15,
    MAX_RESERVA_MINUTOS: 60,
    DEFAULT_RESERVA_MINUTOS: 30,
    MAX_POR_PERSONA_DEFAULT: 10,
    MIN_PRECIO: 1,
    MAX_PRECIO: 10000,
  },
  
  // Configuración de rifas
  RIFAS: {
    MIN_TICKETS: 10,
    MAX_TICKETS: 100000,
    MIN_DIAS_ANTICIPACION: 1,
    MAX_DIAS_ANTICIPACION: 365,
    ESTADOS_VALIDOS: ['BORRADOR', 'ACTIVA', 'PAUSADA', 'SORTEADA', 'CANCELADA'],
  },
  
  // Configuración de pagos
  PAGOS: {
    TIEMPO_VERIFICACION_HORAS: 2,
    MAX_INTENTOS_VERIFICACION: 3,
    GRACIA_VENCIMIENTO_MINUTOS: 5,
  },
  
  // Configuración de sorteos
  SORTEOS: {
    METODOS_VALIDOS: ['ALEATORIO', 'MANUAL'],
    BACKUP_SEMILLAS: true,
    LOG_REPRODUCIBILIDAD: true,
  },
  
  // Configuración de notificaciones
  NOTIFICACIONES: {
    MAX_POR_USUARIO_DIA: 50,
    LIMPIAR_DESPUES_DIAS: 90,
    TIPOS_VALIDOS: [
      'PAGO_RECIBIDO',
      'PAGO_CONFIRMADO', 
      'PAGO_RECHAZADO',
      'GANADOR',
      'SORTEO_REALIZADO',
      'RIFA_CREADA',
      'RIFA_CANCELADA',
      'SISTEMA'
    ],
  },
  
  // Configuración de auditoría
  AUDITORIA: {
    RETENER_LOGS_DIAS: 365,
    ACCIONES_CRITICAS: [
      'REALIZAR_SORTEO',
      'VERIFICACION_APROBAR',
      'VERIFICACION_RECHAZAR',
      'CREAR_RIFA',
      'CANCELAR_RIFA',
      'MODIFICAR_PREMIO'
    ],
    LOG_IPS: true,
    LOG_USER_AGENTS: true,
  },
  
  // Configuración de seguridad
  SEGURIDAD: {
    MAX_INTENTOS_FALLIDOS: 5,
    BLOQUEO_MINUTOS: 30,
    ENMASCARAR_DATOS_PERSONALES: true,
    JWT_EXPIRATION_HOURS: 8,
    REQUIRE_HTTPS_PRODUCTION: true,
  },
  
  // Configuración de validación
  VALIDACION: {
    TELEFONO_REGEX: /^[\d\-\+\(\)\s]+$/,
    EMAIL_REQUIRED: false,
    NOMBRE_MIN_LENGTH: 2,
    NOMBRE_MAX_LENGTH: 100,
    CELULAR_MIN_LENGTH: 10,
    CELULAR_MAX_LENGTH: 20,
  },
  
  // Configuración de performance
  PERFORMANCE: {
    MAX_RESULTADOS_API: 100,
    DEFAULT_LIMIT_API: 20,
    CACHE_RIFAS_ACTIVAS_MINUTOS: 5,
    TIMEOUT_SORTEO_SEGUNDOS: 30,
    MAX_TICKETS_RESERVA_SIMULTANEA: 50,
  },
  
  // URLs y endpoints
  ENDPOINTS: {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    API_BASE: '/api',
    ADMIN_BASE: '/admin',
    PUBLIC_BASE: '/',
  },
  
  // Configuración de archivos
  ARCHIVOS: {
    MAX_SIZE_COMPROBANTE_MB: 5,
    FORMATOS_PERMITIDOS: ['jpg', 'jpeg', 'png', 'pdf'],
    RUTA_UPLOADS: '/uploads',
  },

  // Configuración de email
  EMAIL: {
    get SMTP_ENABLED() {
      return getConfigValueSync('SMTP_ENABLED') !== undefined
        ? getConfigValueSync('SMTP_ENABLED') === 'true'
        : !!getConfigValueSync('SMTP_HOST')
    },
    get HOST() {
      return getConfigValueSync('SMTP_HOST')
    },
    get PORT() {
      const value = getConfigValueSync('SMTP_PORT')
      return value ? parseInt(value as string) : 587
    },
    get USER() {
      return getConfigValueSync('SMTP_USER')
    },
    get PASSWORD() {
      return getConfigValueSync('SMTP_PASSWORD')
    },
    get FROM_ADDRESS() {
      return getConfigValueSync('FROM_EMAIL') || 'noreply@rifas.com'
    },
    TEMPLATES_PATH: '/templates/email',
    get TEMPLATES() {
      try {
        const raw = getConfigValueSync('EMAIL_TEMPLATES')
        return raw ? JSON.parse(raw) : {}
      } catch {
        return {}
      }
    },
  },

  // PayPal eliminado

  // Configuración de SMS
  SMS: {
    get ENABLED() {
      return getConfigValueSync('SMS_ENABLED') !== undefined
        ? getConfigValueSync('SMS_ENABLED') === 'true'
        : !!process.env.SMS_PROVIDER
    },
    get PROVIDER() {
      return getConfigValueSync('SMS_PROVIDER') || process.env.SMS_PROVIDER || 'twilio'
    },
    get ACCOUNT_SID() {
      return getConfigValueSync('SMS_ACCOUNT_SID') || process.env.SMS_ACCOUNT_SID
    },
    get AUTH_TOKEN() {
      return getConfigValueSync('SMS_AUTH_TOKEN') || process.env.SMS_AUTH_TOKEN
    },
    get FROM() {
      return getConfigValueSync('SMS_FROM') || process.env.SMS_FROM || 'Rifas'
    },
    get TEMPLATES() {
      try {
        const raw = getConfigValueSync('SMS_TEMPLATES')
        return raw ? JSON.parse(raw) : {}
      } catch {
        return {}
      }
    },
  },

  // Contacto de administradores
  ADMIN: {
    EMAIL: process.env.ADMIN_EMAIL,
    PHONE: process.env.ADMIN_PHONE,
  },
  
  // Configuración de desarrollo
  DEV: {
    SEED_DATABASE: process.env.NODE_ENV === 'development',
    LOG_LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    MOCK_PAYMENTS: process.env.NODE_ENV === 'development',
    AUTO_APPROVE_PAYMENTS: false,
  },
} as const

// Tipos derivados de la configuración
export type EstadoRifa = typeof CONFIG.RIFAS.ESTADOS_VALIDOS[number]
export type MetodoSorteo = typeof CONFIG.SORTEOS.METODOS_VALIDOS[number]
export type TipoNotificacion = typeof CONFIG.NOTIFICACIONES.TIPOS_VALIDOS[number]

// Validadores comunes
export const validadores = {
  esTelefonoValido: (telefono: string) => CONFIG.VALIDACION.TELEFONO_REGEX.test(telefono),
  esEmailValido: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  esNombreValido: (nombre: string) => 
    nombre.length >= CONFIG.VALIDACION.NOMBRE_MIN_LENGTH && 
    nombre.length <= CONFIG.VALIDACION.NOMBRE_MAX_LENGTH,
  esCelularValido: (celular: string) =>
    celular.length >= CONFIG.VALIDACION.CELULAR_MIN_LENGTH &&
    celular.length <= CONFIG.VALIDACION.CELULAR_MAX_LENGTH &&
    CONFIG.VALIDACION.TELEFONO_REGEX.test(celular),
} as const

// Utilidades comunes
export const utils = {
  // Enmascarar datos personales para logs/APIs públicas
  enmascararCelular: (celular: string) => '***-' + celular.slice(-4),
  enmascararNombre: (nombre: string) => nombre.charAt(0) + '***' + (nombre.length > 1 ? nombre.slice(-1) : ''),
  enmascararEmail: (email: string) => {
    const [user, domain] = email.split('@')
    return user.charAt(0) + '***@' + domain
  },
  
  // Formatear montos
  formatearMonto: (monto: number) => `$${monto.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`,
  
  // Generar IDs únicos para referencias
  generarReferencia: () => `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Calcular tiempo restante en minutos
  minutosRestantes: (fechaVencimiento: Date) => 
    Math.max(0, Math.ceil((fechaVencimiento.getTime() - Date.now()) / 1000 / 60)),
    
  // Validar rango de fechas
  esFechaValida: (fecha: Date, minDias = 0, maxDias = 365) => {
    const ahora = new Date()
    const minFecha = new Date(ahora.getTime() + minDias * 24 * 60 * 60 * 1000)
    const maxFecha = new Date(ahora.getTime() + maxDias * 24 * 60 * 60 * 1000)
    return fecha >= minFecha && fecha <= maxFecha
  },
} as const
