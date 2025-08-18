import { CONFIG } from '@/lib/config'

export async function sendEmail(to: string, subject: string, text: string) {
  if (!CONFIG.EMAIL.SMTP_ENABLED) {
    console.warn('SMTP no está configurado')
    return
  }

  let nodemailer: any
  try {
    // Importación dinámica para evitar errores si la dependencia no está instalada
    nodemailer = (await eval('import("nodemailer")')).default
  } catch (error) {
    console.warn('nodemailer no está instalado, no se envió el email')
    console.log({ to, subject, text })
    return
  }

  const transporter = nodemailer.createTransport({
    host: CONFIG.EMAIL.HOST,
    port: CONFIG.EMAIL.PORT,
    auth: {
      user: CONFIG.EMAIL.USER,
      pass: CONFIG.EMAIL.PASSWORD,
    },
  })

  await transporter.sendMail({
    from: CONFIG.EMAIL.FROM_ADDRESS,
    to,
    subject,
    text,
  })
}
