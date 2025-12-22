"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Eliminando registros de inventario con cantidad = 0 (todas las sucursales y ubicaciones)...');
    const result = await prisma.inventario.deleteMany({
        where: { cantidad: 0 }
    });
    console.log(`✅ Eliminados ${result.count} registros de inventario automáticos`);
}
main()
    .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=cleanup-inventario.js.map