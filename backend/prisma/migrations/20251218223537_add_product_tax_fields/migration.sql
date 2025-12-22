-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "ieps" DOUBLE PRECISION,
ADD COLUMN     "ingredienteActivo" TEXT,
ADD COLUMN     "iva" DOUBLE PRECISION,
ADD COLUMN     "minStock" INTEGER DEFAULT 0;
