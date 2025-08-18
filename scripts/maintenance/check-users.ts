import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.usuario.findMany({
      select: { id: true, email: true, rol: true, nombre: true }
    })
    
    console.log('👥 Usuarios encontrados:')
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Rol: ${user.rol}, Nombre: ${user.nombre}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
