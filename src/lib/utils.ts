import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'VES'): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export type CurrencyFormatOptions = {
  code?: string // ISO 4217 e.g., 'VES'
  symbol?: string // e.g., 'Bs.', '$'
  locale?: string // e.g., 'es-VE'
  position?: 'prefix' | 'suffix' // Where to place symbol when custom
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

// Flexible formatter that can place a custom symbol (e.g., Bs.) as suffix while still using Intl for number formatting
export function formatCurrencyFlexible(amount: number, opts: CurrencyFormatOptions = {}): string {
  const {
    code = 'VES',
    symbol = 'Bs.',
    locale = 'es-VE',
    position = 'prefix',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = opts

  // If a custom symbol is provided, use number formatting without currency then add symbol
  if (symbol) {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount)
    return position === 'suffix' ? `${formatted} ${symbol}` : `${symbol} ${formatted}`
  }

  // Fallback to Intl currency formatting using the code
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatPhone(phone: string): string {
  // Enmascara el teléfono para mostrar solo los últimos 4 dígitos
  if (phone.length <= 4) return phone
  return '***-***-' + phone.slice(-4)
}

export function generateTicketNumber(): string {
  return Math.floor(Math.random() * 10000).toString().padStart(4, '0') // 4 dígitos
}

export function validatePhone(phone: string): boolean {
  // Valida formato de teléfono internacional
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export function isReservationExpired(reservationDate: Date, minutesLimit: number): boolean {
  const now = new Date()
  const expirationDate = new Date(reservationDate.getTime() + minutesLimit * 60000)
  return now > expirationDate
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000)
}

export function generateRandomSeed(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // Force hash into 32-bit integer range
  }
  return hash.toString(36)
}
