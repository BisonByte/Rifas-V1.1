-- AlterTable
ALTER TABLE "configuracion_sitio" ALTER COLUMN "valor" TYPE JSONB USING "valor"::jsonb;
