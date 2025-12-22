-- Add full branch fields to Sucursal
ALTER TABLE "Sucursal" ADD COLUMN IF NOT EXISTS "codigoInterno" TEXT;
ALTER TABLE "Sucursal" ADD COLUMN IF NOT EXISTS "estatus" TEXT NOT NULL DEFAULT 'Activa';
ALTER TABLE "Sucursal" ADD COLUMN IF NOT EXISTS "horarioAtencion" TEXT;
ALTER TABLE "Sucursal" ADD COLUMN IF NOT EXISTS "calleNumero" TEXT;
ALTER TABLE "Sucursal" ADD COLUMN IF NOT EXISTS "colonia" TEXT;
ALTER TABLE "Sucursal" ADD COLUMN IF NOT EXISTS "municipio" TEXT;
ALTER TABLE "Sucursal" ADD COLUMN IF NOT EXISTS "estado" TEXT;
ALTER TABLE "Sucursal" ADD COLUMN IF NOT EXISTS "codigoPostal" TEXT;

-- Unique index for codigoInterno
CREATE UNIQUE INDEX IF NOT EXISTS "Sucursal_codigoInterno_key" ON "Sucursal"("codigoInterno") WHERE "codigoInterno" IS NOT NULL;
