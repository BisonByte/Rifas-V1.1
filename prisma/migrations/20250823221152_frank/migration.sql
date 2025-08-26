-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_rifas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "portadaUrl" TEXT,
    "fechaSorteo" DATETIME NOT NULL,
    "precioPorBoleto" REAL NOT NULL,
    "totalBoletos" INTEGER NOT NULL,
    "limitePorPersona" INTEGER DEFAULT 10,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "tiempoReserva" INTEGER NOT NULL DEFAULT 30,
    "mostrarTopCompradores" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_rifas" ("createdAt", "descripcion", "estado", "fechaSorteo", "id", "limitePorPersona", "nombre", "precioPorBoleto", "tiempoReserva", "totalBoletos", "updatedAt") SELECT "createdAt", "descripcion", "estado", "fechaSorteo", "id", "limitePorPersona", "nombre", "precioPorBoleto", "tiempoReserva", "totalBoletos", "updatedAt" FROM "rifas";
DROP TABLE "rifas";
ALTER TABLE "new_rifas" RENAME TO "rifas";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
