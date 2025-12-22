/*
  Warnings:

  - A unique constraint covering the columns `[codigoInterno]` on the table `Sucursal` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "claveProdServ" TEXT,
ADD COLUMN     "claveUnidad" TEXT,
ADD COLUMN     "factorConversion" DOUBLE PRECISION,
ADD COLUMN     "fichaTecnicaUrl" TEXT,
ADD COLUMN     "guiaAplicacionUrl" TEXT,
ADD COLUMN     "imageKey" TEXT,
ADD COLUMN     "isBulk" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "porcentajeIA" DOUBLE PRECISION,
ADD COLUMN     "retencionIsr" BOOLEAN DEFAULT false,
ADD COLUMN     "retencionIva" BOOLEAN DEFAULT false,
ADD COLUMN     "unidadBase" TEXT,
ADD COLUMN     "unidadVenta" TEXT;

-- CreateTable
CREATE TABLE "CorteCaja" (
    "id" SERIAL NOT NULL,
    "folio" TEXT NOT NULL,
    "sucursal" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "realizadoPor" TEXT NOT NULL,
    "aprobadoPor" TEXT,
    "fondoInicial" DOUBLE PRECISION NOT NULL,
    "ventasEfectivo" DOUBLE PRECISION NOT NULL,
    "salidasEfectivo" DOUBLE PRECISION NOT NULL,
    "totalEsperado" DOUBLE PRECISION NOT NULL,
    "totalContado" DOUBLE PRECISION NOT NULL,
    "desgloseDenominaciones" JSONB NOT NULL,
    "diferencia" DOUBLE PRECISION NOT NULL,
    "tipoDiferencia" TEXT,
    "requiereAprobacion" BOOLEAN NOT NULL DEFAULT false,
    "estatusAprobacion" TEXT,
    "observaciones" TEXT,
    "justificacionDiferencia" TEXT,
    "ticketPdfBase64" TEXT,
    "whatsappEnviado" BOOLEAN NOT NULL DEFAULT false,
    "ventasFolios" JSONB,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "fechaCierre" TIMESTAMP(3),
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorteCaja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CorteCaja_folio_key" ON "CorteCaja"("folio");

-- CreateIndex
CREATE INDEX "CorteCaja_sucursal_fecha_idx" ON "CorteCaja"("sucursal", "fecha");

-- CreateIndex
CREATE INDEX "CorteCaja_realizadoPor_idx" ON "CorteCaja"("realizadoPor");

-- CreateIndex
CREATE INDEX "CorteCaja_estatusAprobacion_idx" ON "CorteCaja"("estatusAprobacion");

-- CreateIndex
-- Nota: el índice único en Sucursal.codigoInterno ya fue creado
-- en una migración previa (20251220124500_add_sucursal_full_fields)
-- por lo que no es necesario recrearlo aquí.
