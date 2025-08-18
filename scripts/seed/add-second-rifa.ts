import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('➕ Creando segunda rifa activa para pruebas...')

  // Crear una segunda rifa ACTIVA con 500 boletos
  const rifa = await prisma.rifa.create({
    data: {
      nombre: 'Rifa de Prueba 2 - PlayStation 5',
      descripcion: 'Participa por una PlayStation 5 con mando adicional',
      fechaSorteo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // en 7 días
      precioPorBoleto: 40.0,
      totalBoletos: 500,
      limitePorPersona: 5,
      estado: 'ACTIVA',
      tiempoReserva: 30
    }
  })
  console.log('✅ Rifa creada:', rifa.nombre)

  // Crear premios
  await prisma.premio.create({
    data: {
      rifaId: rifa.id,
      titulo: 'PlayStation 5',
      descripcion: 'Consola PS5 con 1 TB',
      cantidad: 1,
      orden: 1
    }
  })

  await prisma.premio.create({
    data: {
      rifaId: rifa.id,
      titulo: 'Mando DualSense extra',
      descripcion: 'Control adicional original',
      cantidad: 1,
      orden: 2
    }
  })

  // Crear tickets en lotes
  const tickets: { numero: number; rifaId: string; estado: 'DISPONIBLE' }[] = []
  for (let i = 1; i <= rifa.totalBoletos; i++) {
    tickets.push({ numero: i, rifaId: rifa.id, estado: 'DISPONIBLE' })
  }
  for (let i = 0; i < tickets.length; i += 200) {
    await prisma.ticket.createMany({ data: tickets.slice(i, i + 200) })
  }

  console.log(`✅ ${tickets.length} tickets creados para la segunda rifa`)
  console.log('🎉 Listo. Puedes probar la flecha para cambiar de sorteo.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
