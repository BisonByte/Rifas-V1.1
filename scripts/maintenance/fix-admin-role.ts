import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateAdminRole() {
  try {
    console.log('🔄 Actualizando rol del usuario administrador...')

    const updatedUser = await prisma.usuario.updateMany({
      where: { rol: 'ADMINISTRADOR' },
      data: { rol: 'SUPER_ADMIN' }
    })

    console.log(`✅ ${updatedUser.count} usuarios actualizados con rol SUPER_ADMIN`)
    
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminRole()
  .then(() => {
    console.log('🎉 ¡Actualización completada!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Error en el proceso:', error)
    process.exit(1)
  })
