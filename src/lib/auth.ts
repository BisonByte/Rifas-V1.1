import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from './prisma'

// Configuración JWT
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined')
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const JWT_ALGORITHM = 'HS256'

// Tipos
export interface AuthUser {
  id: string
  nombre: string
  email: string
  rol: 'SUPER_ADMIN' | 'ADMIN' | 'VENDEDOR' | 'AUDITOR'
}

export interface JWTPayload {
  sub: string
  nombre: string
  email: string
  rol: string
  tokenType: 'access' | 'refresh'
  iat: number
  exp: number
}

// Helpers para refresh tokens persistentes
function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function saveRefreshToken(token: string, userId: string) {
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(token),
      userId
    }
  })
}

export async function deleteRefreshToken(token: string) {
  await prisma.refreshToken.deleteMany({
    where: { tokenHash: hashToken(token) }
  })
}

export async function isRefreshTokenValid(token: string): Promise<boolean> {
  const tokenHash = hashToken(token)
  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash }
  })
  return !!existing && !existing.revoked
}

/**
 * Genera un token JWT para el usuario (versión simple para compatibilidad)
 */
export async function generateJWT(user: AuthUser): Promise<string>
export async function generateJWT(
  user: AuthUser,
  expiresIn: string,
  tokenType: 'access' | 'refresh'
): Promise<string>
export async function generateJWT(
  user: AuthUser,
  expiresIn = '24h',
  tokenType: 'access' | 'refresh' = 'access'
): Promise<string> {
  const payload = {
    sub: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    tokenType,
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET)

  return token
}

/**
 * Verifica y decodifica un token JWT
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Verificar que el payload tiene las propiedades necesarias
    if (
      typeof payload.sub === 'string' &&
      typeof payload.nombre === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.rol === 'string' &&
      (payload.tokenType === 'access' || payload.tokenType === 'refresh') &&
      typeof payload.iat === 'number' &&
      typeof payload.exp === 'number'
    ) {
      return payload as unknown as JWTPayload
    }
    
    return null
  } catch (error) {
    console.error('Error verificando JWT:', error)
    return null
  }
}

/**
 * Obtiene el usuario autenticado desde las cookies
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.tokenType !== 'access') {
      return null
    }

    return {
      id: payload.sub,
      nombre: payload.nombre,
      email: payload.email,
      rol: payload.rol as 'SUPER_ADMIN' | 'ADMIN' | 'VENDEDOR' | 'AUDITOR'
    }
  } catch (error) {
    console.error('Error obteniendo usuario autenticado:', error)
    return null
  }
}

/**
 * Verifica credenciales de login
 */
export async function verifyCredentials(email: string, password: string): Promise<AuthUser | null> {
  try {
    // Modo mock para desarrollo
    if (process.env.NODE_ENV === 'development') {
      const { MOCK_USUARIOS } = await import('./mock-data')
      
      const usuario = MOCK_USUARIOS.find(u => u.email === email && u.activo)
      if (!usuario) {
        return null
      }

      const isValid = await bcrypt.compare(password, usuario.password)
      if (!isValid) {
        return null
      }

        return {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
    }

    // Modo producción con base de datos real
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nombre: true,
        email: true,
        password: true,
        rol: true,
        activo: true
      }
    })

    if (!usuario || !usuario.activo) {
      return null
    }

    const isValid = await bcrypt.compare(password, usuario.password)
    if (!isValid) {
      return null
    }

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol as 'SUPER_ADMIN' | 'ADMIN' | 'VENDEDOR' | 'AUDITOR'
    }
  } catch (error) {
    console.error('Error verificando credenciales:', error)
    return null
  }
}

/**
 * Hashea una contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

/**
 * Extrae el token de autenticación desde el request
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Intenta desde cookie
  const tokenFromCookie = request.cookies.get('auth-token')?.value
  if (tokenFromCookie) {
    return tokenFromCookie
  }

  // Intenta desde header Authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

/**
 * Middleware helper para verificar autenticación
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser | null> {
  const token = getTokenFromRequest(request)
  if (!token) {
    return null
  }

  const payload = await verifyJWT(token)
  if (!payload) {
    return null
  }

  return {
    id: payload.sub,
    nombre: payload.nombre,
    email: payload.email,
      rol: payload.rol as 'SUPER_ADMIN' | 'ADMIN' | 'VENDEDOR' | 'AUDITOR'
  }
}

/**
 * Verifica si el usuario tiene el rol requerido
 */
export function hasRole(user: AuthUser, requiredRole: string | string[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.rol)
  }
  return user.rol === requiredRole
}

/**
 * Verifica si el usuario es administrador
 */
export function isAdmin(user: AuthUser): boolean {
  return user.rol === 'ADMIN' || user.rol === 'SUPER_ADMIN'
}

/**
 * Verifica si el usuario es super administrador
 */
export function isSuperAdmin(user: AuthUser): boolean {
  return user.rol === 'SUPER_ADMIN'
}

/**
 * Registra evento de auditoría para autenticación
 */
export async function logAuthEvent(
  userId: string,
  action: string,
  details: any = {},
  ip?: string,
  userAgent?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        evento: action,
        usuarioId: userId,
        accion: action,
        entidad: 'USUARIO',
        entidadId: userId,
        payload: typeof details === 'string' ? details : JSON.stringify(details),
        ipAddress: ip || 'unknown',
        userAgent: userAgent || 'unknown'
      }
    })
  } catch (error) {
    console.error('Error logging auth event:', error)
  }
}
