import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import os from "os";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
  return NextResponse.json({ success: false, error: "Archivo inválido" }, { status: 400 });
    }

    // Validaciones básicas
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Solo se permiten imágenes" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "La imagen debe ser menor a 5MB" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "events");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const originalName = (file.name || "imagen").toLowerCase();
    const originalExt = path.extname(originalName);

    // Si ya es SVG, guardar tal cual en events
    if (file.type === "image/svg+xml" || originalExt === ".svg") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const svgName = `${Date.now()}-${Math.random().toString(36).slice(2)}.svg`;
      const svgPath = path.join(uploadsDir, svgName);
      await writeFile(svgPath, buffer);
      return NextResponse.json({ success: true, url: `/uploads/events/${svgName}`, format: "svg" });
    }

    // Intentar vectorizar PNG/JPG a SVG con imagetracerjs
    let svgString: string | null = null;
    try {
      const tmpPath = path.join(os.tmpdir(), `${Date.now()}-${Math.random().toString(36).slice(2)}${originalExt || ".img"}`);
      const bytes = await file.arrayBuffer();
      await writeFile(tmpPath, Buffer.from(bytes));

      // Carga dinámica para Node runtime
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ImageTracer = (await import("imagetracerjs")).default as any;

      svgString = await new Promise<string>((resolve, reject) => {
        const options = {
          // Ajustes conservadores para reducir errores y producir SVG razonable
          numberofcolors: 12,
          mincolorratio: 0.02,
          blur: 0.5,
          pathomit: 8,
          ltres: 1,
          qtres: 1,
          scale: 1
        } as any;
        try {
          ImageTracer.imageToSVG(tmpPath, options, (svg: string) => resolve(svg));
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      console.warn("Vectorización fallida, se usará imagen raster:", e);
    }

    if (svgString && svgString.startsWith("<svg")) {
      const svgName = `${Date.now()}-${Math.random().toString(36).slice(2)}.svg`;
      const svgPath = path.join(uploadsDir, svgName);
      await writeFile(svgPath, svgString, "utf8");
      return NextResponse.json({ success: true, url: `/uploads/events/${svgName}`, format: "svg" });
    }

    // Fallback estable: guardar raster si no se pudo vectorizar
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeExt = originalExt || ".png";
    const rasterName = `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`;
    const rasterPath = path.join(uploadsDir, rasterName);
    await writeFile(rasterPath, buffer);
  return NextResponse.json({ success: true, url: `/uploads/events/${rasterName}`, format: "raster", message: "No fue posible vectorizar; se guardó la imagen original." });
  } catch (err) {
    console.error("/api/upload error", err);
  return NextResponse.json({ success: false, error: "Error al subir archivo" }, { status: 500 });
  }
}
