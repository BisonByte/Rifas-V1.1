"use client"

import { useMemo, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import {
  QrCode,
  Download,
  Copy,
  Share2,
  X,
  Ticket,
  Sparkles,
  ShieldCheck,
  Minimize2,
  LayoutGrid,
  List,
  Hash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

type TicketReceiptProps = {
  open: boolean
  onClose: () => void
  tickets: number[]
  qrMap: Record<number, string>
  rifaNombre?: string | null
  portadaUrl?: string | null
  referencia?: string | null
  participante?: string | null
  theme?: { primary: string; secondary: string }
}

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ")
}

type Vista = "lista" | "tarjetas" | "numeros"

export function TicketReceipt({
  open,
  onClose,
  tickets,
  qrMap,
  rifaNombre,
  portadaUrl,
  referencia,
  participante,
  theme = { primary: "#2563eb", secondary: "#7c3aed" },
}: TicketReceiptProps) {
  const [vista, setVista] = useState<Vista>("lista")
  const [compacto, setCompacto] = useState(true)
  const [mostrarQR, setMostrarQR] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Paginación más agresiva para mantener compacto
  const pageSize = useMemo(() => {
    if (vista === "lista") return compacto ? 20 : 15
    if (vista === "tarjetas") return compacto ? 12 : 8
    return 100 // números
  }, [vista, compacto])
  
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(tickets.length / pageSize))

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!mounted || !open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
      if (e.key === "ArrowRight" || e.key === "PageDown") setPage((p) => Math.min(totalPages, p + 1))
      if (e.key === "ArrowLeft" || e.key === "PageUp") setPage((p) => Math.max(1, p - 1))
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener("keydown", onKey)
    }
  }, [open, mounted, totalPages])

  useEffect(() => setPage(1), [vista, compacto])

  const refPreview = useMemo(() => (referencia ? String(referencia).slice(-6) : ""), [referencia])
  const padded = (n: number) => String(n).padStart(4, "0")

  if (!mounted) return null
  if (!open && !isClosing) return null

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200)
  }

  const copy = async (text?: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setToast("¡Copiado!")
    } catch {
      setToast("No se pudo copiar")
    } finally {
      setTimeout(() => setToast(null), 1000)
    }
  }

  const printNumbersOnly = () => {
    try {
      const nums = tickets.map((n) => padded(n))
      const ref = referencia ? String(referencia) : ''
      const title = `Tickets ${ref}`
      const html = `<!doctype html><html><head><meta charset="utf-8" /><title>${title}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          html,body{height:100%;margin:0}
          body{font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#fff;color:#0b1726;padding:28px}
          .wrap{max-width:900px;margin:0 auto}
          .head{text-align:center;margin-bottom:18px}
          h1{font-size:20px;margin:0 0 6px;color:#1f2937}
          .ref{font-size:13px;color:#6b7280}
          .grid{display:flex;flex-wrap:wrap;gap:18px;justify-content:center;margin-top:18px}
          .num{width:180px;height:120px;display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:800;border-radius:10px;background:linear-gradient(180deg,#fffaf0,#f3ecd6);border:2px solid #dcc89a;box-shadow:0 8px 20px rgba(11,23,38,0.06);color:#1f2937}
          @media print{ body{padding:8mm} .num{box-shadow:none;border:none} }
        </style>
      </head><body>
        <div class="wrap">
          <div class="head">
            <h1>Tickets</h1>
            ${ref ? `<div class="ref">Ref: ${ref}</div>` : ''}
          </div>
          <div class="grid">
            ${nums.map(n => `<div class="num">${n}</div>`).join('')}
          </div>
        </div>
      </body></html>`

      const w = window.open('', '_blank')
      if (!w) return
      w.document.open()
      w.document.write(html)
      w.document.close()
      w.focus()
      // give browser a moment to render
      setTimeout(() => {
        w.print()
        // optionally keep window open for user; close after print dialog
        // setTimeout(() => w.close(), 500)
      }, 250)
    } catch (e) {
      console.error('printNumbersOnly error', e)
      window.print()
    }
  }

  const waMsg = encodeURIComponent(
    `🎟️ Mis tickets de la rifa ${rifaNombre || ""}\n📋 Ref: ${referencia || ""}\n🎯 Números: ${tickets
      .map((n) => padded(n))
      .join(", ")}`
  )
  const waHref = `https://wa.me/?text=${waMsg}`

  const viewTickets = tickets.slice((page - 1) * pageSize, page * pageSize)

  const content = (
    <div
      aria-modal="true"
      role="dialog"
      aria-label="Comprobante de tickets"
      className={cx(
        "fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3 transition-all duration-200",
        isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
      )}
      style={
        {
          ["--primary" as any]: theme.primary,
          ["--secondary" as any]: theme.secondary,
        } as React.CSSProperties
      }
    >
      {/* Backdrop MÁS CLARO */}
      <div className="absolute inset-0 bg-slate-800/90 backdrop-blur-xl" onClick={handleClose} />

      {/* Modal principal con MÁXIMO CONTRASTE */}
      <div
        className={cx(
          "relative z-10 w-[min(100vw-8px,900px)] max-h-[min(100vh-8px,85vh)] rounded-2xl overflow-hidden transition-all duration-200",
          "border-2 border-white/30 shadow-2xl shadow-black/60",
          "bg-gradient-to-br from-slate-600/98 via-slate-500/98 to-slate-600/98 backdrop-blur-2xl",
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        )}
      >
        {/* SIN fondo de portada para máximo contraste */}
        
        {/* Header con CONTRASTE EXTREMO */}
        <div className="relative px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 border-white/20 bg-gradient-to-r from-slate-500/90 via-slate-400/90 to-slate-500/90">
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight drop-shadow-lg">¡Compra Exitosa!</h2>
                  <p className="text-white/95 text-xs sm:text-sm font-bold">Tus tickets han sido generados</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                {participante && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/90 font-bold">Participante:</span>
                    <span className="text-white font-black max-w-[40vw] truncate">{participante}</span>
                  </div>
                )}
                {referencia && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/90 font-bold">Ref:</span>
                    <code className="px-2 py-0.5 rounded-md bg-white/20 text-white font-black border border-white/30">
                      {referencia}
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* Controles con MÁXIMO CONTRASTE */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Selector de vista con bordes blancos */}
              <div className="flex rounded-lg bg-white/20 p-0.5 border-2 border-white/30">
                <button
                  className={cx(
                    "px-2.5 py-1.5 rounded-md text-xs font-black transition-all",
                    vista === "lista"
                      ? "bg-blue-600 text-white shadow-lg border border-white/20"
                      : "text-white hover:text-white hover:bg-white/20 border border-transparent"
                  )}
                  onClick={() => setVista("lista")}
                >
                  <List className="w-3.5 h-3.5 inline mr-1" />
                  Lista
                </button>
                <button
                  className={cx(
                    "px-2.5 py-1.5 rounded-md text-xs font-black transition-all",
                    vista === "tarjetas"
                      ? "bg-blue-600 text-white shadow-lg border border-white/20"
                      : "text-white hover:text-white hover:bg-white/20 border border-transparent"
                  )}
                  onClick={() => setVista("tarjetas")}
                >
                  <LayoutGrid className="w-3.5 h-3.5 inline mr-1" />
                  Tarjetas
                </button>
                <button
                  className={cx(
                    "px-2.5 py-1.5 rounded-md text-xs font-black transition-all",
                    vista === "numeros"
                      ? "bg-blue-600 text-white shadow-lg border border-white/20"
                      : "text-white hover:text-white hover:bg-white/20 border border-transparent"
                  )}
                  onClick={() => setVista("numeros")}
                >
                  <Hash className="w-3.5 h-3.5 inline mr-1" />
                  Números
                </button>
              </div>

              <button
                onClick={() => setCompacto((c) => !c)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs border-2 border-white/30 transition-all font-bold"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                {compacto ? "Compacto" : "Normal"}
              </button>

              {vista === "lista" && (
                <button
                  onClick={() => setMostrarQR((m) => !m)}
                  className={cx(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border-2 transition-all font-bold",
                    mostrarQR
                      ? "bg-emerald-500 hover:bg-emerald-400 text-white border-white/30"
                      : "bg-white/20 hover:bg-white/30 text-white border-white/30"
                  )}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  QR
                </button>
              )}

              <button
                onClick={printNumbersOnly}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs border-2 border-white/30 transition-all font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>

              {referencia && (
                <button
                  onClick={() => copy(referencia)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs border-2 border-white/30 transition-all font-bold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copiar</span>
                </button>
              )}

              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs transition-all shadow-lg bg-green-600 hover:bg-green-500 border-2 border-white/30 font-bold"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compartir</span>
              </a>

              <button
                onClick={handleClose}
                aria-label="Cerrar"
                className="w-8 h-8 rounded-full bg-red-600/80 hover:bg-red-500 border-2 border-white/30 text-white transition-all flex items-center justify-center font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal con CONTRASTE MÁXIMO */}
        <div className="max-h-[calc(85vh-120px)] overflow-auto px-3 sm:px-4 py-3 custom-scrollbar">
          {/* Paginación superior con máximo contraste */}
          {vista !== "numeros" && totalPages > 1 && (
            <div className="mb-3 flex items-center justify-between text-xs">
              <div className="text-white font-bold">
                {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, tickets.length)} de {tickets.length}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  className="px-2 py-1 rounded-md border-2 border-white/30 bg-white/20 hover:bg-white/30 text-white font-bold disabled:opacity-50 transition-all"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-white text-xs px-2 font-black">
                  {page}/{totalPages}
                </span>
                <button
                  className="px-2 py-1 rounded-md border-2 border-white/30 bg-white/20 hover:bg-white/30 text-white font-bold disabled:opacity-50 transition-all"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Vista Lista con CONTRASTE EXTREMO */}
          {vista === "lista" && (
            <div className="space-y-2">
              {/* Header súper visible */}
              <div className="hidden sm:grid grid-cols-[50px_1fr_80px_120px] items-center gap-3 px-3 py-2 bg-white/20 rounded-lg border-2 border-white/30 text-xs">
                <div className="font-black text-white uppercase">N°</div>
                <div className="font-black text-white uppercase">TICKET</div>
                <div className="font-black text-white uppercase">REF</div>
                <div className="font-black text-white uppercase text-right">ACCIONES</div>
              </div>

              {/* Filas súper visibles */}
              <div className="space-y-1.5">
                {viewTickets.map((n) => (
                  <div
                    key={n}
                    className="grid grid-cols-[50px_1fr_auto] sm:grid-cols-[50px_1fr_80px_120px] items-center gap-3 px-3 py-2 bg-white/15 hover:bg-white/25 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all"
                  >
                    {/* Número súper visible */}
                    <div className="text-xs font-mono text-white font-black">{padded(n)}</div>

                    {/* Contenido principal */}
                    <div className="flex items-center gap-2 min-w-0">
                      {mostrarQR && (
                        <div className="shrink-0 rounded-md bg-white p-1.5 shadow-sm">
                          {qrMap[n] ? (
                            <img
                              src={qrMap[n]}
                              alt={`QR ${padded(n)}`}
                              className="rounded block"
                              style={{ width: 28, height: 28 }}
                            />
                          ) : (
                            <div
                              className="rounded grid place-items-center text-slate-600 border border-slate-300"
                              style={{ width: 28, height: 28 }}
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        {rifaNombre && (
                          <div className="text-xs text-white font-black truncate mb-0.5">{rifaNombre}</div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-black font-mono text-white drop-shadow-lg">
                            {padded(n)}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-white font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                            <span className="hidden sm:inline">Oficial</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Referencia súper visible */}
                    <div className="hidden sm:block text-xs text-white font-mono font-black">
                      {refPreview || "—"}
                    </div>

                    {/* Acciones súper visibles */}
                    <div className="justify-self-end flex items-center gap-1">
                      <button
                        onClick={() => copy(padded(n))}
                        className="px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 border-2 border-white/30 text-xs text-white font-bold transition-all"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {qrMap[n] && (
                        <a
                          href={qrMap[n]}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 border-2 border-white/30 text-xs text-white font-bold transition-all"
                        >
                          <QrCode className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vista Tarjetas con CONTRASTE MÁXIMO */}
          {vista === "tarjetas" && (
            <div
              className="grid justify-items-center gap-3"
              style={{ 
                gridTemplateColumns: compacto 
                  ? "repeat(auto-fit, minmax(min(160px, 100%), 1fr))" 
                  : "repeat(auto-fit, minmax(min(180px, 100%), 1fr))" 
              }}
            >
              {viewTickets.map((n) => (
                <div key={n} className="w-full max-w-[200px]">
                  <div className="relative rounded-xl overflow-hidden bg-white/15 border-2 border-white/30 shadow-lg">
                    {/* Header súper visible */}
                    <div className="px-3 py-2 bg-white/20 border-b-2 border-white/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5 text-white" />
                          <span className="text-xs font-black tracking-wider text-white uppercase">
                            TICKET
                          </span>
                        </div>
                        {refPreview && <span className="text-xs text-white font-black">#{refPreview}</span>}
                      </div>
                    </div>

                    <div className="p-3 space-y-3">
                      {rifaNombre && (
                        <div className="text-center">
                          <h4 className="text-xs font-black text-white leading-tight line-clamp-2">{rifaNombre}</h4>
                        </div>
                      )}

                      {/* Número principal súper visible */}
                      <div className="text-center space-y-1.5">
                        <div className="text-2xl font-black font-mono text-white drop-shadow-lg tracking-wider">
                          {padded(n)}
                        </div>
                        <div className="w-12 h-0.5 mx-auto rounded-full bg-white/60" />
                      </div>

                      {/* Verificación súper visible */}
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="h-6 w-6 rounded-md shadow-lg border border-white/30"
                          style={{
                            background: "linear-gradient(45deg, #8b5cf6, #3b82f6, #10b981, #f59e0b)",
                          }}
                        />
                        <div className="text-xs text-white">
                          <div className="flex items-center gap-1 text-white">
                            <ShieldCheck className="w-3 h-3 text-emerald-300" />
                            <span className="font-black">Verificación</span>
                          </div>
                        </div>
                      </div>

                      {/* QR súper visible */}
                      <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                        <div className="p-2 rounded-lg bg-white shadow border border-white/30">
                          {qrMap[n] ? (
                            <img
                              src={qrMap[n]}
                              alt={`QR ${padded(n)}`}
                              className="rounded block"
                              style={{ width: "50px", height: "50px" }}
                            />
                          ) : (
                            <div
                              className="rounded grid place-items-center text-slate-600 border border-dashed border-slate-400"
                              style={{ width: "50px", height: "50px" }}
                            >
                              <QrCode className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div
                            className="h-6 rounded-md border-2 border-white/40 bg-white/10"
                          />
                          <div className="flex items-center justify-between text-xs text-white font-black">
                            <span>REF:{refPreview?.slice(-4) || "XXXX"}</span>
                            <span>{padded(n)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Chips súper visibles */}
                      <div className="text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs border border-white/30 font-bold">
                            Oficial
                          </span>
                          {refPreview && (
                            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs border border-white/30 font-bold">
                              {refPreview}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vista Números súper visible */}
          {vista === "numeros" && (
            <div className="text-center space-y-3">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">Números Asignados</h3>
                <p className="text-white text-sm font-bold">Total de {tickets.length} tickets</p>
              </div>
              <div 
                className="grid gap-2" 
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))" }}
              >
                {tickets.map((n) => (
                  <div
                    key={n}
                    className="p-3 rounded-lg bg-white/15 border-2 border-white/30 text-center hover:border-white/50 hover:bg-white/25 transition-all group"
                  >
                    <div className="text-lg font-black font-mono text-white drop-shadow-lg group-hover:drop-shadow-xl transition-all">
                      {padded(n)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paginación inferior súper visible */}
          {vista !== "numeros" && totalPages > 1 && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs">
              <button
                className="px-2 py-1 rounded-md border-2 border-white/30 bg-white/20 hover:bg-white/30 text-white font-bold disabled:opacity-50 transition-all"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-white px-2 font-black">
                Página {page} de {totalPages}
              </span>
              <button
                className="px-2 py-1 rounded-md border-2 border-white/30 bg-white/20 hover:bg-white/30 text-white font-bold disabled:opacity-50 transition-all"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer súper visible */}
        <div className="px-3 sm:px-4 py-2.5 border-t-2 border-white/20 bg-white/15">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white font-bold">
            <p>🎟️ Conserva tus números para el sorteo</p>
            <p>💬 ¿Dudas? Contáctanos</p>
          </div>
        </div>
      </div>

      {/* Toast súper visible */}
      <div
        className={cx(
          "pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 transition-all duration-200",
          toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        {toast && (
          <div className="pointer-events-auto flex items-center gap-2 rounded-lg bg-white/90 border-2 border-slate-600 px-3 py-1.5 text-xs text-slate-800 shadow-xl backdrop-blur-sm font-black">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{toast}</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media print {
          :global(body) {
            background: white;
          }
          .custom-scrollbar {
            max-height: none !important;
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  )

  if (typeof document !== "undefined") {
    return createPortal(content, document.body)
  }
  return content
}