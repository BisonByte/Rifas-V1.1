-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "celular" TEXT,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'VENDEDOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rifas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "portadaUrl" TEXT,
    "fechaSorteo" TIMESTAMP(3) NOT NULL,
    "precioPorBoleto" DOUBLE PRECISION NOT NULL,
    "precioUSD" DOUBLE PRECISION,
    "totalBoletos" INTEGER NOT NULL,
    "limitePorPersona" INTEGER DEFAULT 10,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "tiempoReserva" INTEGER NOT NULL DEFAULT 30,
    "mostrarTopCompradores" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rifas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premios" (
    "id" TEXT NOT NULL,
    "rifaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "orden" INTEGER,
    "ticketGanadorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participantes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "cedula" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "rifaId" TEXT NOT NULL,
    "participanteId" TEXT,
    "compraId" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'DISPONIBLE',
    "monto" DOUBLE PRECISION,
    "fechaReserva" TIMESTAMP(3),
    "fechaVencimiento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras" (
    "id" TEXT NOT NULL,
    "rifaId" TEXT NOT NULL,
    "participanteId" TEXT NOT NULL,
    "cantidadTickets" INTEGER NOT NULL DEFAULT 1,
    "monto" DOUBLE PRECISION NOT NULL,
    "montoTotal" DOUBLE PRECISION NOT NULL,
    "metodoPago" TEXT NOT NULL DEFAULT 'TRANSFERENCIA',
    "estadoPago" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "voucherUrl" TEXT,
    "imagenComprobante" TEXT,
    "bancoId" TEXT,
    "referencia" TEXT,
    "paymentId" TEXT,
    "fechaVencimiento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuentas_bancarias" (
    "id" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "titular" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipoCuenta" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuentas_bancarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sorteos" (
    "id" TEXT NOT NULL,
    "rifaId" TEXT NOT NULL,
    "numeroGanador" INTEGER,
    "ticketGanadorId" TEXT,
    "metodo" TEXT NOT NULL DEFAULT 'AUTOMATICO',
    "semilla" TEXT,
    "fechaSorteo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sorteos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "usuarioId" TEXT,
    "participanteId" TEXT,
    "paraAdministradores" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "fechaLectura" TIMESTAMP(3),
    "creadaPor" TEXT,
    "leidaPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "evento" TEXT NOT NULL,
    "accion" TEXT,
    "usuarioId" TEXT,
    "entidad" TEXT,
    "entidadId" TEXT,
    "detalles" TEXT,
    "payload" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3),
    "creadaPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuraciones" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'STRING',
    "categoria" TEXT NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuraciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_sitio" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_sitio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodos_pago" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "numeroCuenta" TEXT,
    "tipoCuenta" TEXT,
    "cedula" TEXT,
    "telefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metodos_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redes_sociales" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "redes_sociales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "premios_ticketGanadorId_key" ON "premios"("ticketGanadorId");

-- CreateIndex
CREATE UNIQUE INDEX "participantes_celular_key" ON "participantes"("celular");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_numero_rifaId_key" ON "tickets"("numero", "rifaId");

-- CreateIndex
CREATE UNIQUE INDEX "cuentas_bancarias_numero_key" ON "cuentas_bancarias"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "sorteos_rifaId_key" ON "sorteos"("rifaId");

-- CreateIndex
CREATE UNIQUE INDEX "sorteos_ticketGanadorId_key" ON "sorteos"("ticketGanadorId");

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_clave_key" ON "configuraciones"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_sitio_clave_key" ON "configuracion_sitio"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "metodos_pago_nombre_key" ON "metodos_pago"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "redes_sociales_nombre_key" ON "redes_sociales"("nombre");

-- AddForeignKey
ALTER TABLE "premios" ADD CONSTRAINT "premios_rifaId_fkey" FOREIGN KEY ("rifaId") REFERENCES "rifas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "premios" ADD CONSTRAINT "premios_ticketGanadorId_fkey" FOREIGN KEY ("ticketGanadorId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_rifaId_fkey" FOREIGN KEY ("rifaId") REFERENCES "rifas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_participanteId_fkey" FOREIGN KEY ("participanteId") REFERENCES "participantes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "compras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_rifaId_fkey" FOREIGN KEY ("rifaId") REFERENCES "rifas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_participanteId_fkey" FOREIGN KEY ("participanteId") REFERENCES "participantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_bancoId_fkey" FOREIGN KEY ("bancoId") REFERENCES "cuentas_bancarias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteos" ADD CONSTRAINT "sorteos_rifaId_fkey" FOREIGN KEY ("rifaId") REFERENCES "rifas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteos" ADD CONSTRAINT "sorteos_ticketGanadorId_fkey" FOREIGN KEY ("ticketGanadorId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

