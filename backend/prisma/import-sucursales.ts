import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type HeaderMap = {
  tienda: number;
  codigoInterno: number;
  status: number;
  tel: number;
  correo: number;
  encargado: number;
  calleNumero: number;
  colonia: number;
  municipio: number;
  estado: number;
  cp: number;
  horario: number;
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
  for (const c of candidates) {
    const target = normalize(c);
    // Búsqueda exacta
    let i = normalized.indexOf(target);
    if (i !== -1) return i;
    // Búsqueda flexible para encabezados con caracteres especiales
    i = normalized.findIndex((h) => h.includes(target) || target.includes(h));
    if (i !== -1) return i;
  }
  return -1;
}

// Parser CSV mínimo que respeta comillas
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      // Si ya estaba en comillas y la siguiente es otra comilla, es escape
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // saltar el escape
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function composeUbicacion(
  calleNumero?: string,
  colonia?: string,
  municipio?: string,
  estado?: string,
  cp?: string
): string | undefined {
  const parts = [calleNumero, colonia, municipio, estado, cp && `CP ${cp}`]
    .filter((v) => !!v && v.trim().length > 0) as string[];
  return parts.length ? parts.join(', ') : undefined;
}

async function main() {
  const fileFromEnv = process.env.SUCS_CSV_FILE;
  const filePath = fileFromEnv
    ? path.resolve(fileFromEnv)
    : path.resolve(__dirname, '../../sucursales-copandaro.csv');

  if (!fs.existsSync(filePath)) {
    console.error(`No se encontró el archivo de sucursales en: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    console.error('El archivo de sucursales no tiene filas suficientes.');
    process.exit(1);
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());

  const map: HeaderMap = {
    tienda: findIndex(headers, ['Tienda', 'Sucursal', 'Nombre', 'Nombre de tienda']),
    codigoInterno: findIndex(headers, ['Codigo Interno', 'Código Interno', 'Codigo', 'Código', 'C�digo Interno']),
    status: findIndex(headers, ['Actica o Inactivo', 'Activa o Inactivo', 'Estatus', 'Estado']),
    tel: findIndex(headers, ['Tel', 'Telefono', 'Teléfono']),
    correo: findIndex(headers, ['correo', 'Email', 'Correo'] ),
    encargado: findIndex(headers, ['Encargado', 'Responsable']),
    calleNumero: findIndex(headers, ['Calle y Numero', 'Calle y Número', 'Calle y N°', 'Calle y N�mero�']),
    colonia: findIndex(headers, ['Colonia', 'Barrio']),
    municipio: findIndex(headers, ['Municipio / Ciudad *', 'Municipio', 'Ciudad']),
    estado: findIndex(headers, ['Estado', 'Entidad']),
    cp: findIndex(headers, ['Codigo Postal', 'Código Postal', 'CP', 'C�digo Postal']),
    horario: findIndex(headers, ['Horario de Atencion', 'Horario de Atención', 'Horario de Atenci�n']),
  };

  if (map.tienda === -1) {
    console.error('Encabezado requerido no encontrado: Tienda/Sucursal/Nombre');
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);

    const tienda = cols[map.tienda]?.trim();
    if (!tienda) { skipped++; continue; }

    const codigoInterno = map.codigoInterno >= 0 ? cols[map.codigoInterno]?.trim() || undefined : undefined;
    const statusRaw = map.status >= 0 ? cols[map.status]?.trim() || undefined : undefined;
    const telefono = map.tel >= 0 ? cols[map.tel]?.trim() || undefined : undefined;
    const email = map.correo >= 0 ? cols[map.correo]?.trim() || undefined : undefined;
    const responsable = map.encargado >= 0 ? cols[map.encargado]?.trim() || undefined : undefined;

    const calleNumero = map.calleNumero >= 0 ? cols[map.calleNumero]?.trim() : undefined;
    const colonia = map.colonia >= 0 ? cols[map.colonia]?.trim() : undefined;
    const municipio = map.municipio >= 0 ? cols[map.municipio]?.trim() : undefined;
    const estado = map.estado >= 0 ? cols[map.estado]?.trim() : undefined;
    const cp = map.cp >= 0 ? cols[map.cp]?.trim() : undefined;
    const horarioAtencion = map.horario >= 0 ? cols[map.horario]?.trim() : undefined;

    const estatus = statusRaw
      ? (statusRaw.toLowerCase().includes('inact') ? 'Inactiva' : 'Activa')
      : undefined;

    const ubicacion = composeUbicacion(calleNumero, colonia, municipio, estado, cp);

    try {
      const existing = await prisma.sucursal.findFirst({ where: { nombre: tienda } });
      if (existing) {
        await prisma.sucursal.update({
          where: { id: existing.id },
          data: {
            codigoInterno: codigoInterno ?? existing.codigoInterno ?? undefined,
            estatus: estatus ?? existing.estatus ?? undefined,
            telefono: telefono ?? existing.telefono ?? undefined,
            email: email ?? existing.email ?? undefined,
            responsable: responsable ?? existing.responsable ?? undefined,
            ubicacion: ubicacion ?? existing.ubicacion ?? undefined,
            horarioAtencion: horarioAtencion ?? existing.horarioAtencion ?? undefined,
            calleNumero: calleNumero ?? existing.calleNumero ?? undefined,
            colonia: colonia ?? existing.colonia ?? undefined,
            municipio: municipio ?? existing.municipio ?? undefined,
            estado: estado ?? existing.estado ?? undefined,
            codigoPostal: cp ?? existing.codigoPostal ?? undefined,
          },
        });
        updated++;
      } else {
        await prisma.sucursal.create({
          data: {
            nombre: tienda,
            codigoInterno,
            estatus,
            telefono,
            email,
            responsable,
            ubicacion,
            horarioAtencion,
            calleNumero,
            colonia,
            municipio,
            estado,
            codigoPostal: cp,
          },
        });
        created++;
      }
    } catch (err) {
      console.warn(`Fila ${i + 1}: error al procesar tienda="${tienda}".`, err);
      skipped++;
    }
  }

  console.log('Importación de sucursales completada', { created, updated, skipped });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
