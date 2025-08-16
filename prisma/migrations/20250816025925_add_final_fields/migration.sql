-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN "payload" TEXT;

-- AlterTable
ALTER TABLE "notificaciones" ADD COLUMN "creadaPor" TEXT;
ALTER TABLE "notificaciones" ADD COLUMN "leidaPor" TEXT;
