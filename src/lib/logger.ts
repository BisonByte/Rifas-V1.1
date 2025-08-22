import fs from 'fs'
import path from 'path'

const logDir = path.join(process.cwd(), 'logs')
const logFile = path.join(logDir, 'errors.log')

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

export function logError(message: string, meta?: unknown) {
  const timestamp = new Date().toISOString()
  const metaString = meta ? ` ${JSON.stringify(meta)}` : ''
  const entry = `[${timestamp}] ${message}${metaString}\n`

  fs.appendFile(logFile, entry, err => {
    if (err) {
      console.error('Failed to write to log file', err)
    }
  })
}

export default {
  logError,
}

