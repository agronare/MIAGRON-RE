-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "folio" TEXT NOT NULL,
    "clienteId" INTEGER,
    "clienteNombre" TEXT NOT NULL,
    "clienteRfc" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sucursal" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "impuestos" DOUBLE PRECISION NOT NULL,
    "descuentoTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "referenciaPago" TEXT,
    "montoRecibido" DOUBLE PRECISION,
    "cambioDevuelto" DOUBLE PRECISION,
    "montoPagado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estatus" TEXT NOT NULL,
    "requiereFactura" BOOLEAN NOT NULL DEFAULT false,
    "ticketPdfBase64" TEXT,
    "cfdiEstatus" TEXT NOT NULL DEFAULT 'sin_solicitar',
    "cfdiUuid" TEXT,
    "cfdiXmlPath" TEXT,
    "cfdiPdfPath" TEXT,
    "cfdiErrorMsg" TEXT,
    "cfdiTimbradoAt" TIMESTAMP(3),
    "cfdiPacProvider" TEXT,
    "regimenFiscal" TEXT,
    "usoCfdi" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaItem" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER,
    "sku" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "unidad" TEXT NOT NULL DEFAULT 'PZA',
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "impuestoMonto" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "claveProdServ" TEXT,
    "claveUnidad" TEXT,
    "objetoImpuesto" TEXT,
    "tasaIva" DOUBLE PRECISION,

    CONSTRAINT "VentaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudCfdi" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "clienteEmail" TEXT NOT NULL,
    "clienteTelefono" TEXT,
    "estatusSolicitud" TEXT NOT NULL DEFAULT 'pendiente',
    "notaCliente" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "procesadoAt" TIMESTAMP(3),

    CONSTRAINT "SolicitudCfdi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Venta_folio_key" ON "Venta"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "Venta_cfdiUuid_key" ON "Venta"("cfdiUuid");

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaItem" ADD CONSTRAINT "VentaItem_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudCfdi" ADD CONSTRAINT "SolicitudCfdi_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
