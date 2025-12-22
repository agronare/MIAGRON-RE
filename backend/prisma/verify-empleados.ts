import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  const empleados = await prisma.empleado.findMany({
    include: { user: true },
    orderBy: { id: 'asc' }
  });
  
  console.log('\n📊 EMPLEADOS EN LA BASE DE DATOS:\n');
  console.log('Total empleados:', empleados.length);
  console.log('\n');
  
  empleados.forEach((emp, idx) => {
    console.log(`${idx + 1}. ${emp.primerNombre} ${emp.apellidoPaterno}`);
    console.log(`   📧 Email: ${emp.user.email}`);
    console.log(`   💼 Puesto: ${emp.puesto}`);
    console.log(`   🏢 Departamento: ${emp.departamento}`);
    console.log(`   📞 Teléfono: ${emp.user.telefono}`);
    console.log(`   🏛️ Sucursal: ${emp.user.sucursal}`);
    console.log(`   💰 Salario: $${emp.salario?.toLocaleString()}`);
    console.log(`   🔢 CURP: ${emp.curp}`);
    console.log(`   🆔 NSS: ${emp.nss}`);
    console.log(`   👤 Role: ${emp.user.role}`);
    console.log(`   ✅ Activo: ${emp.user.isActive ? 'Sí' : 'No'}`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

verify().catch(console.error);
