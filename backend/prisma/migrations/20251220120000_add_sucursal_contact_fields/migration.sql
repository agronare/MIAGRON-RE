-- Add telefono and email columns to Sucursal
ALTER TABLE "Sucursal" ADD COLUMN IF NOT EXISTS "telefono" TEXT;
ALTER TABLE "Sucursal" ADD COLUMN IF NOT EXISTS "email" TEXT;
