-- CreateTable
CREATE TABLE "InventarioTransfer" (
    "id" SERIAL NOT NULL,
    "transferId" TEXT NOT NULL,
    "productoId" INTEGER NOT NULL,
    "origenSucursalId" INTEGER NOT NULL,
    "destinoSucursalId" INTEGER NOT NULL,
    "origenInventarioId" INTEGER NOT NULL,
    "destinoInventarioId" INTEGER NOT NULL,
    "movimientoSalidaId" INTEGER NOT NULL,
    "movimientoEntradaId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "costoUnit" DOUBLE PRECISION,
    "lote" TEXT,
    "referencia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventarioTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventarioTransfer_transferId_key" ON "InventarioTransfer"("transferId");

-- AddForeignKey
ALTER TABLE "InventarioTransfer" ADD CONSTRAINT "InventarioTransfer_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
