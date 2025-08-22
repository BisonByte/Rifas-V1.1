import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function fixAdmin() {
  try {
    console.log('🔄 Corrigiendo usuario administrador...')

    // Eliminar usuario con rol incorrecto
    await prisma.usuario.deleteMany({
      where: { rol: 'ADMINISTRADOR' }
    })
    console.log('🗑️ Usuario con rol ADMINISTRADOR eliminado')

    // Crear nuevo admin con rol correcto
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.usuario.create({
      data: {
        nombre: 'Admin Principal',
        email: 'admin@rifas.com',
        celular: '+1234567890',
        password: hashedPassword,
        rol: 'SUPER_ADMIN',
        activo: true
      }
    })

    console.log('✅ Usuario administrador creado exitosamente:')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Password: admin123')
    console.log('👤 Nombre:', admin.nombre)
    console.log('🔒 Rol:', admin.rol)
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixAdmin()
  .then(() => {
    console.log('🎉 ¡Corrección completada!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Error en el proceso:', error)
    process.exit(1)
  })
