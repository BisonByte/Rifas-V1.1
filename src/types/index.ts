export interface Rifa {
  id: string
  nombre: string
  descripcion: string
  descripcionHtml?: string
  fechaSorteo: Date
  precioPorBoleto: number
  totalBoletos: number
  limitePorPersona?: number
  estado: EstadoRifa
  tiempoReserva: number
  moneda: string
  zonaHoraria: string
  metaTitulo?: string
  metaDescripcion?: string
  imagenOg?: string
  configuracion?: any
  createdAt: Date
  updatedAt: Date
  premios?: Premio[]
  tickets?: Ticket[]
  _count?: {
    tickets: number
    premios: number
  }
}

export interface Premio {
  id: string
  rifaId: string
  titulo: string
  descripcion?: string
  foto?: string
  cantidad: number
  orden?: number
  ticketGanadorId?: string
  createdAt: Date
  updatedAt: Date
  rifa?: Rifa
  ticketGanador?: Ticket
}

export interface Participante {
  id: string
  nombre: string
  celular: string
  email?: string
  pais?: string
  consentimientoTc: boolean
  createdAt: Date
  updatedAt: Date
  tickets?: Ticket[]
  compras?: Compra[]
}

export interface Ticket {
  id: string
  numero: number
  rifaId: string
  participanteId?: string
  compraId?: string
  estado: EstadoTicket
  monto?: number
  fechaReserva?: Date
  fechaVencimiento?: Date
  numerosExtra?: any
  notas?: string
  createdAt: Date
  updatedAt: Date
  rifa?: Rifa
  participante?: Participante
  compra?: Compra
  premio?: Premio
}

export interface Compra {
  id: string
  rifaId: string
  participanteId: string
  monto: number
  metodoPago: string
  estadoPago: EstadoPago
  voucherUrl?: string
  bancoId?: string
  fechaOperacion?: Date
  referencia?: string
  notas?: string
  createdAt: Date
  updatedAt: Date
  rifa?: Rifa
  participante?: Participante
  banco?: CuentaBancaria
  tickets?: Ticket[]
}

export interface CuentaBancaria {
  id: string
  banco: string
  titular: string
  numero: string
  tipoCuenta?: string
  logo?: string
  instrucciones?: string
  activa: boolean
  orden?: number
  createdAt: Date
  updatedAt: Date
  compras?: Compra[]
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  celular?: string
  password: string
  rol: RolUsuario
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FAQ {
  id: string
  rifaId?: string
  pregunta: string
  respuesta: string
  orden?: number
  visible: boolean
  createdAt: Date
  updatedAt: Date
  rifa?: Rifa
}

export interface Sorteo {
  id: string
  rifaId: string
  fechaHora: Date
  metodo: string
  semilla?: string
  hash?: string
  resultado?: string
  actaUrl?: string
  estado: EstadoSorteo
  createdAt: Date
  updatedAt: Date
  rifa?: Rifa
}

export interface AuditLog {
  id: string
  usuarioId?: string
  accion: string
  entidad: string
  entidadId: string
  payload?: any
  ip?: string
  userAgent?: string
  createdAt: Date
  usuario?: Usuario
}

// Enums
export enum RolUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  VENDEDOR = 'VENDEDOR',
  AUDITOR = 'AUDITOR'
}

export enum EstadoRifa {
  BORRADOR = 'BORRADOR',
  ACTIVA = 'ACTIVA',
  PAUSADA = 'PAUSADA',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA'
}

export enum EstadoTicket {
  DISPONIBLE = 'DISPONIBLE',
  RESERVADO = 'RESERVADO',
  PENDIENTE_PAGO = 'PENDIENTE_PAGO',
  PAGADO = 'PAGADO',
  RECHAZADO = 'RECHAZADO',
  CADUCADO = 'CADUCADO',
  GANADOR = 'GANADOR'
}

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  CANCELADO = 'CANCELADO'
}

export enum EstadoSorteo {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO'
}

// Tipos de respuesta de API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Tipos para formularios
export interface TicketSelection {
  numero: number
  estado: EstadoTicket
  selected?: boolean
}

export interface SorteoResult {
  ticketGanador: number
  participanteGanador: string
  fechaHora: Date
  semilla: string
  hash: string
}

// Estadísticas del dashboard
export interface DashboardStats {
  totalVentas: number
  totalParticipantes: number
  ticketsVendidos: number
  ticketsDisponibles: number
  conversion: number
  ventasPorDia: Array<{
    fecha: string
    ventas: number
    participantes: number
  }>
  mediosPagoUsados: Array<{
    metodo: string
    cantidad: number
    porcentaje: number
  }>
}
