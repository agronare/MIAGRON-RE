import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type HeaderMap = {
  codigo: number;
  nombre: number;
  minStock: number;
  costo: number;
  precio: number;
  descripcionCol: number;
  categoriaCol: number;
  fabricante: number;
  ingrediente: number;
  objetoImpuesto: number;
  iva: number;
  ieps: number;
  descripcionDetallada: number;
  ventaGranel: number;
  porcentajeIA: number;
  fichaUrl: number;
  guiaUrl: number;
  claveProdServ: number;
  claveUnidad: number;
  retencionIva: number;
  retencionIsr: number;
};

function normalize(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function findIndex(headers: string[], candidates: string[]): number {
  const normalized = headers.map(normalize);
  const bare = normalized.map((h) => h.replace(/[^a-z0-9]/g, ''));

  for (const c of candidates) {
    const cNorm = normalize(c);
    const cBare = cNorm.replace(/[^a-z0-9]/g, '');

    // Igualdad exacta normalizada
    const exact = normalized.indexOf(cNorm);
    if (exact !== -1) return exact;

    // Comparación en forma 'sin caracteres' para capturar variantes con slashes/spaces
    const exactBare = bare.indexOf(cBare);
    if (exactBare !== -1) return exactBare;

    // Buscar por inclusión de palabras clave (todos los tokens aparecen)
    const tokens = cNorm.split(/[^a-z0-9]+/).filter(Boolean);
    for (let i = 0; i < normalized.length; i++) {
      const h = normalized[i];
      const matchesAll = tokens.every((t) => h.includes(t));
      if (matchesAll) return i;
    }
  }

  return -1;
}

function parseCurrency(value?: string | null): number | null {
  if (!value) return null;
  const cleaned = value
    .replace(/\s+/g, '')
    .replace(/\$/g, '')
    .replace(/,/g, '')
    .replace(/[^0-9.-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '.') return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseInteger(value?: string | null): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9-]/g, '');
  if (!cleaned || cleaned === '-') return null;
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : null;
}

function parseRate(value?: string | null): number | null {
  if (!value) return null;
  const v = value.trim();
  // Busca un número (entero o decimal). Si viene con %, lo normaliza a fracción.
  const m = v.match(/(-?\d+(?:[\.,]\d+)?)\s*%?/);
  if (!m) return null;
  const numStr = m[1].replace(',', '.');
  const num = parseFloat(numStr);
  if (!Number.isFinite(num)) return null;
  const hasPercent = v.includes('%');
  return hasPercent ? num / 100 : (num > 1 ? num / 100 : num); // si parece 16, asume 0.16
}

async function ensureDefaultSucursal() {
  // Usa la sucursal con id=1 si existe; si no, crea una por defecto
  const existing = await prisma.sucursal.findFirst();
  if (existing) return existing;
  const created = await prisma.sucursal.create({
    data: {
      nombre: 'Oficina Central (Copandaro de Galeana)',
      ubicacion: 'Copándaro de Galeana, Mich.',
      responsable: 'Sistema',
    },
  });
  return created;
}

async function main() {
  const fileFromEnv = process.env.CATALOG_FILE;
  const filePath = fileFromEnv
    ? path.resolve(fileFromEnv)
    : path.resolve(__dirname, '../../catalogo.CSV');

  if (!fs.existsSync(filePath)) {
    console.error(`No se encontró el archivo de catálogo en: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    console.error('El archivo de catálogo no tiene filas suficientes.');
    process.exit(1);
  }

  const headers = lines[0].split(',').map((h) => h.trim());

  const map: HeaderMap = {
    codigo: findIndex(headers, ['SKU/Codigo', 'SKU/Código', 'SKU / Código interno', 'SKU', 'Codigo', 'Código']),
    nombre: findIndex(headers, ['Nombre comercial', 'Nombre (producto)', 'Nombre', 'Producto']),
    minStock: findIndex(headers, ['Stock Mínimo (Alerta)', 'Inventario minimo de stock', 'Inventario mínimo de stock', 'MinStock', 'Stock minimo']),
    costo: findIndex(headers, ['Costo']),
    precio: findIndex(headers, ['Precio Base de Venta', 'Precio', 'Precio Base']),
    descripcionCol: findIndex(headers, ['Descripción detallada (Factura)', 'Descripción', 'Descripcion', 'Tipo']),
    categoriaCol: findIndex(headers, ['Categoría', 'Categoria']),
    fabricante: findIndex(headers, ['Fabricante / Marca', 'Empresa/Fabricante', 'Fabricante', 'Empresa']),
    ingrediente: findIndex(headers, ['Ingrediente activo', 'Ingrediente Activo', 'Ingrediente']),
    objetoImpuesto: findIndex(headers, ['Objeto de Impuesto', 'Objeto de impuesto']),
    iva: findIndex(headers, ['Tasa de IVA', 'IVA']),
    ieps: findIndex(headers, ['Tasa de IEPS', 'IEPS', 'Tasa IEPS']),
    descripcionDetallada: findIndex(headers, ['Descripción detallada (Factura)', 'Descripción detallada', 'Descripcion detallada']),
    ventaGranel: findIndex(headers, ['venta a granel?', 'venta a granel', 'venta_granel', 'venta a granel?']),
    porcentajeIA: findIndex(headers, ['Porcentaje de ngrediente Activo', 'Porcentaje de ingrediente Activo', 'Porcentaje de Ingrediente Activo', 'Porcentaje de ingrediente activo']),
    fichaUrl: findIndex(headers, ['Ficha Técnica (URL)', 'Ficha Técnica', 'FichaTecnica', 'Ficha Técnica (URL)']),
    guiaUrl: findIndex(headers, ['Guía de Aplicación (URL)', 'Guía de Aplicación', 'Guia de Aplicacion', 'Guía de Aplicación (URL)']),
    claveProdServ: findIndex(headers, ['Clave Producto/Servicio (SAT,con ayuda de la IA', 'Clave Producto/Servicio', 'Clave Producto/Servicio (SAT)', 'Clave Producto/Servicio (SAT,con ayuda de la IA']),
    claveUnidad: findIndex(headers, ['Clave de Unidad (SAT)', 'Clave de Unidad', 'Clave Unidad', 'Clave de Unidad (SAT)']),
    retencionIva: findIndex(headers, ['Aplica Retención de IVA', 'Aplica Retencion de IVA', 'Retencion IVA', 'Aplica Retencion IVA']),
    retencionIsr: findIndex(headers, ['Aplica Retención de ISR', 'Aplica Retencion de ISR', 'Retencion ISR', 'Aplica Retencion ISR']),
  };

  if (map.codigo === -1 || map.nombre === -1) {
    console.error('Encabezados requeridos no encontrados: SKU/Codigo y/o Nombre (producto)');
    process.exit(1);
  }

  const sucursal = await ensureDefaultSucursal();

  // BORRADO: eliminar dependencias antes de recrear productos
  console.log('Iniciando limpieza de productos existentes y registros relacionados...');
  try {
    const delTransfer = await prisma.inventarioTransfer.deleteMany();
    const delMovs = await prisma.inventarioMovimiento.deleteMany();
    const delInv = await prisma.inventario.deleteMany();
    const delProds = await prisma.product.deleteMany();
    console.log('Limpieza completada:', {
      inventarioTransfers: delTransfer.count,
      movimientos: delMovs.count,
      inventarios: delInv.count,
      productos: delProds.count,
    });
  } catch (err) {
    console.error('Error al limpiar tablas relacionadas antes de la importación:', err);
    // No terminamos el proceso aquí; intentaremos continuar con la importación.
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  // Procesar cada fila de productos
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    const cols = row.split(',');

    const codigoRaw = cols[map.codigo]?.trim();
    const nombreRaw = cols[map.nombre]?.trim();

    if (!codigoRaw || !nombreRaw) {
      skipped++;
      continue;
    }

    const minStock = map.minStock >= 0 ? parseInteger(cols[map.minStock]) : null;
    const costo = map.costo >= 0 ? parseCurrency(cols[map.costo]) : null;
    const precio = map.precio >= 0 ? parseCurrency(cols[map.precio]) : null;

    const descripcionDet = map.descripcionDetallada >= 0 ? cols[map.descripcionDetallada]?.trim() : undefined;
    const ventaGranelRaw = map.ventaGranel >= 0 ? cols[map.ventaGranel]?.trim().toLowerCase() : undefined;
    const ventaGranel = ventaGranelRaw ? (ventaGranelRaw.startsWith('s') || ventaGranelRaw === 'yes' || ventaGranelRaw === 'true' ? true : false) : undefined;
    const porcentajeIA = map.porcentajeIA >= 0 ? parseRate(cols[map.porcentajeIA]) : null;
    const fichaUrl = map.fichaUrl >= 0 ? cols[map.fichaUrl]?.trim() || undefined : undefined;
    const guiaUrl = map.guiaUrl >= 0 ? cols[map.guiaUrl]?.trim() || undefined : undefined;
    const claveProdServ = map.claveProdServ >= 0 ? cols[map.claveProdServ]?.trim() || undefined : undefined;
    const claveUnidad = map.claveUnidad >= 0 ? cols[map.claveUnidad]?.trim() || undefined : undefined;
    const retIvaRaw = map.retencionIva >= 0 ? cols[map.retencionIva]?.trim().toLowerCase() : undefined;
    const retIsrRaw = map.retencionIsr >= 0 ? cols[map.retencionIsr]?.trim().toLowerCase() : undefined;
    const retencionIva = retIvaRaw ? (retIvaRaw.startsWith('s') || retIvaRaw === 'yes' || retIvaRaw === 'true' ? true : false) : undefined;
    const retencionIsr = retIsrRaw ? (retIsrRaw.startsWith('s') || retIsrRaw === 'yes' || retIsrRaw === 'true' ? true : false) : undefined;

    const descripcionTipo = map.descripcionCol >= 0 ? cols[map.descripcionCol]?.trim() : '';
    const categoriaDet = map.categoriaCol >= 0 ? cols[map.categoriaCol]?.trim() : '';
    const categoria = [descripcionTipo, categoriaDet].filter(Boolean).join(' / ') || null;

    const fabricante = map.fabricante >= 0 ? cols[map.fabricante]?.trim() || null : null;

    const ingrediente = map.ingrediente >= 0 ? cols[map.ingrediente]?.trim() : '';
    const objImp = map.objetoImpuesto >= 0 ? cols[map.objetoImpuesto]?.trim() : '';
    const iva = map.iva >= 0 ? cols[map.iva]?.trim() : '';
    const ieps = map.ieps >= 0 ? cols[map.ieps]?.trim() : '';

      // Ya no persistimos Objeto de Impuesto en descripción: va a su propia columna
      const notasFiscalesParts: string[] = [];
      const descripcion = notasFiscalesParts.length ? `Notas: ${notasFiscalesParts.join(' | ')}` : undefined;
      const ivaRate = iva ? parseRate(iva) : null;
      const iepsRate = ieps ? parseRate(ieps) : null;

    try {
      const existing = await prisma.product.findUnique({ where: { codigo: codigoRaw } });
      if (existing) {
        await prisma.product.update({
          where: { codigo: codigoRaw },
          data: {
            sku: codigoRaw,
            nombre: nombreRaw,
            precio: precio ?? existing.precio,
            costo: costo ?? existing.costo ?? undefined,
            categoria: categoria ?? existing.categoria ?? undefined,
            fabricante: fabricante ?? existing.fabricante ?? undefined,
            minStock: minStock ?? existing.minStock ?? undefined,
            ingredienteActivo: ingrediente || existing.ingredienteActivo || undefined,
            porcentajeIA: porcentajeIA ?? existing.porcentajeIA ?? undefined,
            iva: ivaRate ?? existing.iva ?? undefined,
            ieps: iepsRate ?? existing.ieps ?? undefined,
            objetoImpuesto: objImp || existing.objetoImpuesto || undefined,
            isBulk: ventaGranel ?? existing.isBulk ?? undefined,
            fichaTecnicaUrl: fichaUrl ?? existing.fichaTecnicaUrl ?? undefined,
            guiaAplicacionUrl: guiaUrl ?? existing.guiaAplicacionUrl ?? undefined,
            claveProdServ: claveProdServ ?? existing.claveProdServ ?? undefined,
            claveUnidad: claveUnidad ?? existing.claveUnidad ?? undefined,
            retencionIva: retencionIva ?? existing.retencionIva ?? undefined,
            retencionIsr: retencionIsr ?? existing.retencionIsr ?? undefined,
            // Si ya hay descripcion, anexa las nuevas notas si existen y no están incluidas
            descripcion:
              // Prefiere la descripción detallada (factura) si existe, sino usa 'descripcion' notas fiscales
              descripcionDet ?? (descripcion && existing.descripcion && !existing.descripcion.includes('Notas:')
                ? `${existing.descripcion} | ${descripcion}`
                : descripcion ?? existing.descripcion ?? undefined),
          },
        });
        updated++;
      } else {
        const createdProd = await prisma.product.create({
          data: {
            codigo: codigoRaw,
            sku: codigoRaw,
            nombre: nombreRaw,
            precio: precio ?? 0,
            stock: 0,
            costo: costo ?? undefined,
            categoria: categoria ?? undefined,
            fabricante: fabricante ?? undefined,
            descripcion: descripcionDet ?? descripcion ?? undefined,
            minStock: minStock ?? undefined,
            ingredienteActivo: ingrediente || undefined,
            porcentajeIA: porcentajeIA ?? undefined,
            iva: ivaRate ?? undefined,
            ieps: iepsRate ?? undefined,
            objetoImpuesto: objImp || undefined,
            isBulk: ventaGranel ?? undefined,
            fichaTecnicaUrl: fichaUrl ?? undefined,
            guiaAplicacionUrl: guiaUrl ?? undefined,
            claveProdServ: claveProdServ ?? undefined,
            claveUnidad: claveUnidad ?? undefined,
            retencionIva: retencionIva ?? undefined,
            retencionIsr: retencionIsr ?? undefined,
          },
        });

        created++;
      }
    } catch (err) {
      console.warn(`Fila ${i + 1}: error al procesar código=${codigoRaw}.`, err);
      skipped++;
    }
  }

  console.log('Importación completada', { created, updated, skipped, sucursal: sucursal.nombre });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
