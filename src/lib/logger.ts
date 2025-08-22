let logError: ((message: string, meta?: unknown) => Promise<void>) | undefined

if (typeof window === 'undefined') {
  const path = await import('path')
  const fs = await import('fs/promises')

  const logDir = path.join(process.cwd(), 'logs')
  const logFile = path.join(logDir, 'errors.log')

  logError = async (message: string, meta?: unknown) => {
    const timestamp = new Date().toISOString()
    const metaString = meta ? ` ${JSON.stringify(meta)}` : ''
    const entry = `[${timestamp}] ${message}${metaString}\n`
    try {
      await fs.mkdir(logDir, { recursive: true })
      await fs.appendFile(logFile, entry)
    } catch (err) {
      console.error('Failed to write to log file', err)
    }
  }
}

const logger = { logError }

export { logError }
export default logger
