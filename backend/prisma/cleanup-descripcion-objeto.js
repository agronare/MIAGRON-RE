"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function cleanDescripcion(descripcion) {
    let d = descripcion;
    // Eliminar el segmento "Objeto de Impuesto: ..." con separadores opcionales
    d = d.replace(/\s*\|\s*Objeto de Impuesto:[^|\n\r]*/gi, '');
    d = d.replace(/Objeto de Impuesto:[^|\n\r]*\s*\|\s*/gi, '');
    d = d.replace(/Objeto de Impuesto:[^|\n\r]*/gi, '');
    // Si quedan múltiples separadores " | ", normalizar
    d = d.replace(/\s*\|\s*/g, ' | ');
    d = d.replace(/\s*\|\s*$/g, ''); // quitar separador al final
    d = d.replace(/^\s*\|\s*/g, ''); // quitar separador al inicio
    // Si empieza con "Notas:" y ya no hay contenido después, limpiar todo
    const notasMatch = d.match(/^\s*Notas:\s*(.*)$/i);
    if (notasMatch) {
        const resto = notasMatch[1].trim();
        if (!resto) {
            return null; // sin contenido útil
        }
        d = `Notas: ${resto}`; // normalizar espacios
    }
    d = d.trim();
    return d.length ? d : null;
}
async function main() {
    const productos = await prisma.product.findMany({
        where: {
            descripcion: { contains: 'Objeto de Impuesto', mode: 'insensitive' },
        },
        select: { id: true, descripcion: true },
    });
    let updated = 0;
    for (const p of productos) {
        const nueva = p.descripcion ? cleanDescripcion(p.descripcion) : null;
        if (nueva !== p.descripcion) {
            await prisma.product.update({ where: { id: p.id }, data: { descripcion: nueva ?? undefined } });
            updated++;
        }
    }
    console.log('Limpieza completada', { scanned: productos.length, updated });
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=cleanup-descripcion-objeto.js.map