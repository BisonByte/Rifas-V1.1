import { z } from 'zod'
import { RolUsuario } from '@prisma/client'

// Esquemas de validación para el formulario de compra
export const CompraFormSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  celular: z.string().min(8, 'El celular debe tener al menos 8 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  numerosSeleccionados: z.array(z.number()).min(1, 'Debe seleccionar al menos un número'),
  metodoPago: z.string().min(1, 'Debe seleccionar un método de pago'),
  voucher: z.any().optional(),
  aceptaTerminos: z.boolean().refine(val => val === true, {
    message: 'Debe aceptar los términos y condiciones'
  })
})

export type CompraFormData = z.infer<typeof CompraFormSchema>

// Esquema para verificación de tickets
export const VerificacionSchema = z.object({
  busqueda: z.string().min(1, 'Ingrese un número de ticket o celular'),
  tipo: z.enum(['ticket', 'celular'])
})

export type VerificacionData = z.infer<typeof VerificacionSchema>

// Esquema para rifas
export const RifaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  descripcionHtml: z.string().optional(),
  fechaSorteo: z.date(),
  precioPorBoleto: z.number().positive('El precio debe ser mayor a 0'),
  totalBoletos: z.number().int().positive('El total de boletos debe ser mayor a 0'),
  // Límite por persona deshabilitado
  limitePorPersona: z.number().int().positive().optional().or(z.undefined()),
  tiempoReserva: z.number().int().positive().default(30),
  moneda: z.string().default('VES'),
  zonaHoraria: z.string().default('UTC')
})

export type RifaData = z.infer<typeof RifaSchema>

// Esquema para premios
export const PremioSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
  descripcion: z.string().optional(),
  foto: z.string().optional(),
  cantidad: z.number().int().positive().default(1),
  orden: z.number().int().optional()
})

export type PremioData = z.infer<typeof PremioSchema>

// Esquema para cuentas bancarias
export const CuentaBancariaSchema = z.object({
  banco: z.string().min(1, 'El nombre del banco es requerido'),
  titular: z.string().min(1, 'El titular es requerido'),
  numero: z.string().min(1, 'El número de cuenta es requerido'),
  tipoCuenta: z.string().optional(),
  instrucciones: z.string().optional(),
  activa: z.boolean().default(true),
  orden: z.number().int().optional()
})

export type CuentaBancariaData = z.infer<typeof CuentaBancariaSchema>

// Esquema para usuarios
export const UsuarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  celular: z.string().optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.nativeEnum(RolUsuario).default(RolUsuario.VENDEDOR),
  activo: z.boolean().default(true)
})

export type UsuarioData = z.infer<typeof UsuarioSchema>

// Esquema para login
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
})

export type LoginData = z.infer<typeof LoginSchema>
