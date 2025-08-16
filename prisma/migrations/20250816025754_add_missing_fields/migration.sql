/*
  Warnings:

  - Made the column `montoTotal` on table `compras` required. This step will fail if there are existing NULL values in that column.

*/
-- Actualizar montoTotal NULL con valores calculados antes de la migración
UPDATE "compras" SET "montoTotal" = "monto" * "cantidadTickets" WHERE "montoTotal" IS NULL;

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN "accion" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "creadaPor" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "timestamp" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_compras" (
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
INSERT INTO "new_compras" ("bancoId", "cantidadTickets", "createdAt", "estadoPago", "fechaVencimiento", "id", "metodoPago", "monto", "montoTotal", "participanteId", "referencia", "rifaId", "updatedAt", "voucherUrl") SELECT "bancoId", "cantidadTickets", "createdAt", "estadoPago", "fechaVencimiento", "id", "metodoPago", "monto", "montoTotal", "participanteId", "referencia", "rifaId", "updatedAt", "voucherUrl" FROM "compras";
DROP TABLE "compras";
ALTER TABLE "new_compras" RENAME TO "compras";
CREATE TABLE "new_notificaciones" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_notificaciones" ("createdAt", "id", "leida", "mensaje", "metadata", "tipo", "titulo", "updatedAt", "usuarioId") SELECT "createdAt", "id", "leida", "mensaje", "metadata", "tipo", "titulo", "updatedAt", "usuarioId" FROM "notificaciones";
DROP TABLE "notificaciones";
ALTER TABLE "new_notificaciones" RENAME TO "notificaciones";
CREATE TABLE "new_sorteos" (
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
INSERT INTO "new_sorteos" ("createdAt", "fechaSorteo", "id", "metodo", "numeroGanador", "rifaId", "semilla", "ticketGanadorId", "updatedAt", "verificado") SELECT "createdAt", "fechaSorteo", "id", "metodo", "numeroGanador", "rifaId", "semilla", "ticketGanadorId", "updatedAt", "verificado" FROM "sorteos";
DROP TABLE "sorteos";
ALTER TABLE "new_sorteos" RENAME TO "sorteos";
CREATE UNIQUE INDEX "sorteos_rifaId_key" ON "sorteos"("rifaId");
CREATE UNIQUE INDEX "sorteos_ticketGanadorId_key" ON "sorteos"("ticketGanadorId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
