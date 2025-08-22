type LogLevel = 'ERROR' | 'WARN' | 'INFO'

const LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || 'ERROR'

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
}

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'access_token',
  'authorization',
  'secret',
]

function shouldLog(level: LogLevel) {
  return LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[LOG_LEVEL]
}

function sanitizeMeta(meta: unknown): unknown {
  if (!meta || typeof meta !== 'object') return meta

  if (Array.isArray(meta)) {
    return meta.map((item) => sanitizeMeta(item))
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
    if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]'
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeMeta(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

let logError: ((message: string, meta?: unknown) => Promise<void>) | undefined
let logWarn: ((message: string, meta?: unknown) => Promise<void>) | undefined

if (typeof window === 'undefined') {
  ;(async () => {
    const path = await import('path')
    const fs = await import('fs/promises')

    const logDir = path.join(process.cwd(), 'logs')
    const logFile = path.join(logDir, 'errors.log')

    const writeLog = async (
      level: LogLevel,
      message: string,
      meta?: unknown,
    ) => {
      if (!shouldLog(level)) return
      const timestamp = new Date().toISOString()
      const sanitized = meta ? sanitizeMeta(meta) : undefined
      const metaString = sanitized ? ` ${JSON.stringify(sanitized)}` : ''
      const entry = `[${timestamp}] [${level}] ${message}${metaString}\n`
      try {
        await fs.mkdir(logDir, { recursive: true })
        await fs.appendFile(logFile, entry)
      } catch (err) {
        console.error('Failed to write to log file', err)
      }
    }

    logError = async (message: string, meta?: unknown) =>
      writeLog('ERROR', message, meta)

    logWarn = async (message: string, meta?: unknown) =>
      writeLog('WARN', message, meta)
  })()
}

const logger = { logError, logWarn }

export { logError, logWarn, sanitizeMeta }
export default logger

