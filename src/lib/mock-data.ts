/**
 * MODO DEMO - Datos mock para demostración
 * En producción, reemplazar con conexión real a base de datos
 */

// Usuarios administradores
export const MOCK_USUARIOS = [
  {
    id: "admin-1",
    nombre: "Administrador Principal",
    email: "admin@rifas.com",
    password: "$2a$12$FwrusYFdVVgfr3SP997KM.OBr0.lDtj1FkJKcT8SzSxNbpIPlf0kC",
    rol: "SUPER_ADMIN" as const,
    celular: "+1234567890",
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "admin-2",
    nombre: "Administrador Secundario",
    email: "admin2@rifas.com",
    password: "$2a$12$ESSOvSnKfX0FOUyLVgNgIeSSdacBMaOLHB5un5LPvvG5e1fugGxkK",
    rol: "ADMIN" as const,
    celular: "+0987654321",
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "vendedor-1",
    nombre: "Vendedor Demo",
    email: "vendedor@rifas.com",
    password: "$2a$12$LKjiuo5CideLHlB2H1SD8.VDoBJOhooBHT/U6CjLQ9.28jrebVYMm",
    rol: "VENDEDOR" as const,
    celular: "+1122334455",
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export const MOCK_STATS = {
  totalRifas: 5,
  totalParticipantes: 147,
  totalTicketsVendidos: 234,
  ingresosTotales: 15680.50,
  ventasUltimas24h: {
    monto: 1250.75,
    tickets: 8
  },
  pagosPendientes: 3,
  // Datos adicionales para el dashboard
  topRifas: [
    {
      id: '1',
      nombre: 'Rifa iPhone 15 Pro',
      ticketsVendidos: 89,
      porcentajeVendido: 89,
      ingresos: 8900.00
    },
    {
      id: '2',
      nombre: 'Rifa Auto Toyota Corolla',
      ticketsVendidos: 67,
      porcentajeVendido: 67,
      ingresos: 6700.00
    },
    {
      id: '3',
      nombre: 'Rifa Casa en la Playa',
      ticketsVendidos: 45,
      porcentajeVendido: 22.5,
      ingresos: 4500.00
    }
  ],
  proximosSorteos: [
    {
      id: '1',
      nombre: 'Rifa iPhone 15 Pro',
      fecha: '2024-01-15',
      diasRestantes: 2
    },
    {
      id: '2',
      nombre: 'Rifa Auto Toyota Corolla',
      fecha: '2024-01-20',
      diasRestantes: 7
    }
  ]
}

export const MOCK_TOP_RIFAS = [
  {
    id: '1',
    nombre: 'Rifa iPhone 15 Pro',
    ticketsVendidos: 89,
    porcentajeVendido: 89,
    ingresos: 8900.00
  },
  {
    id: '2',
    nombre: 'Rifa Auto Toyota Corolla',
    ticketsVendidos: 67,
    porcentajeVendido: 67,
    ingresos: 6700.00
  },
  {
    id: '3',
    nombre: 'Rifa Casa en la Playa',
    ticketsVendidos: 45,
    porcentajeVendido: 22.5,
    ingresos: 4500.00
  }
]

export const MOCK_PROXIMOS_SORTEOS = [
  {
    id: '1',
    nombre: 'Rifa iPhone 15 Pro',
    fecha: '2024-01-15',
    diasRestantes: 2
  },
  {
    id: '2',
    nombre: 'Rifa Auto Toyota Corolla',
    fecha: '2024-01-20',
    diasRestantes: 7
  }
]

export const MOCK_SORTEOS_COMPLETADOS = [
  {
    id: 's1',
    rifa: {
      nombre: 'Rifa Laptop Gaming'
    },
    ganador: {
      nombre: 'Ana Martínez'
    },
    numeroGanador: 123,
    fechaSorteo: '2024-01-05',
    estado: 'COMPLETADO'
  }
]

export const MOCK_PAGOS_PENDIENTES = [
  {
    id: '1',
    monto: 150.00,
    fechaCreacion: '2024-01-10',
    numerosTickets: [23, 45, 67],
    participante: {
      nombre: 'Juan Pérez',
      celular: '+1234567890'
    },
    rifa: {
      nombre: 'Rifa iPhone 15 Pro'
    },
    comprobante: 'voucher_001.jpg'
  },
  {
    id: '2',
    monto: 300.00,
    fechaCreacion: '2024-01-11',
    numerosTickets: [12, 34, 56, 78, 90, 11],
    participante: {
      nombre: 'María García',
      celular: '+0987654321'
    },
    rifa: {
      nombre: 'Rifa Auto Toyota Corolla'
    },
    comprobante: 'voucher_002.jpg'
  },
  {
    id: '3',
    monto: 75.00,
    fechaCreacion: '2024-01-12',
    numerosTickets: [99, 88, 77],
    participante: {
      nombre: 'Carlos López',
      celular: '+1122334455'
    },
    rifa: {
      nombre: 'Rifa Casa en la Playa'
    },
    comprobante: 'voucher_003.jpg'
  }
]

export const MOCK_MODE = process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL?.includes('postgresql://')
