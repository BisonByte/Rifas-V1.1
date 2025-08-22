export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import os from 'os'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No se encontró archivo' })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Solo se permiten imágenes' })
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'La imagen debe ser menor a 5MB' })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Rutas de subida
    const uploadsRoot = path.join(process.cwd(), 'public', 'uploads')
    const rasterDir = path.join(uploadsRoot, 'comprobantes')
    const svgDir = path.join(uploadsRoot, 'svg')
    if (!existsSync(rasterDir)) await mkdir(rasterDir, { recursive: true })
    if (!existsSync(svgDir)) await mkdir(svgDir, { recursive: true })

    const timestamp = Date.now()
    const originalExt = path.extname(file.name).toLowerCase()
    const safeBase = `comprobante_${timestamp}`

    // Si ya es SVG, guardar tal cual en svgDir
    if (file.type === 'image/svg+xml' || originalExt === '.svg') {
      const svgName = `${safeBase}.svg`
      const svgPath = path.join(svgDir, svgName)
      await writeFile(svgPath, buffer)
      const svgUrl = `/uploads/svg/${svgName}`
      return NextResponse.json({ success: true, url: svgUrl, message: 'SVG subido exitosamente' })
    }

    // Intentar vectorizar a SVG usando imagetracerjs (mejor para logos/íconos)
    // Para fotos complejas, caemos a guardar raster.
    let svgUrl: string | null = null
    try {
      const tmpPath = path.join(os.tmpdir(), `${safeBase}${originalExt || '.img'}`)
      await writeFile(tmpPath, buffer)

      // Carga dinámica para evitar afectar el edge runtime
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ImageTracer = (await import('imagetracerjs')).default as any

      const svgString: string = await new Promise((resolve, reject) => {
        const options = {
          // Menos colores = SVG más limpio; ajustable desde admin si se desea
          numberofcolors: 12,
          mincolorratio: 0.02,
          blur: 0.5,
          pathomit: 8,
          ltres: 1,
          qtres: 1,
        }
        try {
          // En Node, ImageTracer acepta ruta local
          ImageTracer.imageToSVG(tmpPath, options, (svg: string) => resolve(svg))
        } catch (e) {
          reject(e)
        }
      })

      if (svgString && svgString.startsWith('<svg')) {
        const svgName = `${safeBase}.svg`
        const svgPath = path.join(svgDir, svgName)
        await writeFile(svgPath, svgString, 'utf8')
        svgUrl = `/uploads/svg/${svgName}`
      }
    } catch (e) {
      console.warn('Vectorización SVG fallida, guardando raster:', e)
    }

    if (svgUrl) {
      return NextResponse.json({ success: true, url: svgUrl, message: 'Imagen vectorizada a SVG' })
    }

    // Fallback: guardar raster
    const rasterName = `${safeBase}${originalExt || '.png'}`
    const rasterPath = path.join(rasterDir, rasterName)
    await writeFile(rasterPath, buffer)
    const rasterUrl = `/uploads/comprobantes/${rasterName}`
    return NextResponse.json({ success: true, url: rasterUrl, message: 'Imagen subida (raster)'} )

  } catch (error) {
    console.error('Error subiendo imagen:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
