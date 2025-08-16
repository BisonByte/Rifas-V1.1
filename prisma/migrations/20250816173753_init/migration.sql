-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "celular" TEXT,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'VENDEDOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "rifas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaSorteo" DATETIME NOT NULL,
    "precioPorBoleto" REAL NOT NULL,
    "totalBoletos" INTEGER NOT NULL,
    "limitePorPersona" INTEGER DEFAULT 10,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "tiempoReserva" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "premios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rifaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "orden" INTEGER,
    "ticketGanadorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "premios_rifaId_fkey" FOREIGN KEY ("rifaId") REFERENCES "rifas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "premios_ticketGanadorId_fkey" FOREIGN KEY ("ticketGanadorId") REFERENCES "tickets" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "participantes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "rifaId" TEXT NOT NULL,
    "participanteId" TEXT,
    "compraId" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'DISPONIBLE',
    "monto" REAL,
    "fechaReserva" DATETIME,
    "fechaVencimiento" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tickets_rifaId_fkey" FOREIGN KEY ("rifaId") REFERENCES "rifas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tickets_participanteId_fkey" FOREIGN KEY ("participanteId") REFERENCES "participantes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tickets_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "compras" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "compras" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rifaId" TEXT NOT NULL,
    "participanteId" TEXT NOT NULL,
    "cantidadTickets" INTEGER NOT NULL DEFAULT 1,
    "monto" REAL NOT NULL,
    "montoTotal" REAL NOT NULL,
    "metodoPago" TEXT NOT NULL DEFAULT 'TRANSFERENCIA',
    "estadoPago" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "voucherUrl" TEXT,
    "bancoId" TEXT,
    "referencia" TEXT,
    "fechaVencimiento" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "compras_rifaId_fkey" FOREIGN KEY ("rifaId") REFERENCES "rifas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "compras_participanteId_fkey" FOREIGN KEY ("participanteId") REFERENCES "participantes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "compras_bancoId_fkey" FOREIGN KEY ("bancoId") REFERENCES "cuentas_bancarias" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cuentas_bancarias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "banco" TEXT NOT NULL,
    "titular" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipoCuenta" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "sorteos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rifaId" TEXT NOT NULL,
    "numeroGanador" INTEGER,
    "ticketGanadorId" TEXT,
    "metodo" TEXT NOT NULL DEFAULT 'AUTOMATICO',
    "semilla" TEXT,
    "fechaSorteo" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sorteos_rifaId_fkey" FOREIGN KEY ("rifaId") REFERENCES "rifas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sorteos_ticketGanadorId_fkey" FOREIGN KEY ("ticketGanadorId") REFERENCES "tickets" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "usuarioId" TEXT,
    "participanteId" TEXT,
    "paraAdministradores" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "fechaLectura" DATETIME,
    "creadaPor" TEXT,
    "leidaPor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evento" TEXT NOT NULL,
    "accion" TEXT,
    "usuarioId" TEXT,
    "entidad" TEXT,
    "entidadId" TEXT,
    "detalles" TEXT,
    "payload" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" DATETIME,
    "creadaPor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "configuraciones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'STRING',
    "categoria" TEXT NOT NULL DEFAULT 'GENERAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
