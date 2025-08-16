import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🚀 Creando usuario administrador...')

    // Verificar si ya existe un admin
    const existingAdmin = await prisma.usuario.findFirst({
      where: { rol: 'ADMINISTRADOR' }
    })

    if (existingAdmin) {
      console.log('✅ Ya existe un usuario administrador:', existingAdmin.email)
      return existingAdmin
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Crear el usuario admin
    const admin = await prisma.usuario.create({
      data: {
        nombre: 'Admin Principal',
        email: 'admin@rifas.com',
        celular: '+1234567890',
        password: hashedPassword,
        rol: 'ADMINISTRADOR',
        activo: true
      }
    })

    console.log('✅ Usuario administrador creado exitosamente:')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Password: admin123')
    console.log('👤 Nombre:', admin.nombre)
    console.log('🔒 Rol:', admin.rol)

    return admin
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createAdmin()
    .then(() => {
      console.log('🎉 ¡Proceso completado!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Error en el proceso:', error)
      process.exit(1)
    })
}

export default createAdmin
