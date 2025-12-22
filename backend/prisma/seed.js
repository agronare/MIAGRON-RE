"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    // Default admin user
    const adminEmail = 'admin@agronare.com';
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            name: 'Admin System',
            email: adminEmail,
            passwordHash: await bcryptjs_1.default.hash('admin123', 10),
            role: 'Gerente General',
            isActive: true,
            verified: true,
            // Mantener coherencia con BRANCHES_MOCK del frontend
            sucursal: 'Oficina Central (Copandaro de Galeana)'
        },
    });
    // ============================================================================
    // EMPLEADOS Y USUARIOS (SINCRONIZADO CON LA TABLA DE EMPLEADOS)
    // ============================================================================
    console.log('👥 Creando usuarios y empleados...');
    const empleadosData = [
        {
            // Admin user ya creado arriba
            userId: admin.id,
            numeroEmpleado: '1010101010',
            primerNombre: 'Admin',
            apellidoPaterno: 'System',
            departamento: 'Dirección',
            puesto: 'Gerente General',
            fechaIngreso: new Date('2024-01-01'),
            estatus: 'activo',
            tipoContrato: 'Indeterminado',
            frecuenciaPago: 'SEMANA',
            salario: 0,
            telefono: '443 414 5533',
            email: '7320204450@agronare.com',
            curp: 'GOSR980107HMNNLL09',
            nss: '222222222',
            direccion: 'ENEA',
            contactoEmergenciaNombre: '(Mama,Papa,Conyuge, otro familiar)',
            contactoEmergenciaTelefono: '111 111 1111',
            sucursal: 'Oficina Central (Administracion)'
        },
        {
            numeroEmpleado: '1010124150',
            primerNombre: 'Arturo',
            apellidoPaterno: 'Neri',
            apellidoMaterno: 'Gonzalez',
            departamento: 'Dirección General',
            puesto: 'CEO',
            fechaIngreso: new Date('2024-01-01'),
            estatus: 'activo',
            tipoContrato: 'Indeterminado',
            frecuenciaPago: 'SEMANA',
            salario: 1.0,
            telefono: '443 000 0000',
            email: '1010124150@agronare.com',
            curp: 'NAGR00000000000000',
            nss: '111111111',
            direccion: 'ENEA',
            contactoEmergenciaNombre: '(Mama,Papa,Conyuge, otro familiar)',
            contactoEmergenciaTelefono: '000 000 0000',
            sucursal: 'SUC-ZAMORA'
        },
        {
            numeroEmpleado: '7320204450',
            primerNombre: 'Raul',
            apellidoPaterno: 'Gonzalez',
            apellidoMaterno: 'Salas',
            departamento: 'Administración y Finanzas',
            puesto: 'Director Administrativo',
            fechaIngreso: new Date('2024-01-01'),
            estatus: 'activo',
            tipoContrato: 'Indeterminado',
            frecuenciaPago: 'SEMANA',
            salario: 8000.0,
            telefono: '443 227 0901',
            email: '7320204450@agronare.com',
            curp: 'GOSR980107HMNNLL09',
            nss: '222222222',
            direccion: 'ENEA',
            contactoEmergenciaNombre: '(Mama,Papa,Conyuge, otro familiar)',
            contactoEmergenciaTelefono: '111 111 1111',
            sucursal: 'Oficina Central (Copandaro de Galeana)'
        },
        {
            numeroEmpleado: '2326244451',
            primerNombre: 'Lupita',
            apellidoPaterno: 'Dominguez',
            departamento: 'Asesor de venta',
            puesto: 'Gerente de Ventas',
            fechaIngreso: new Date('2024-01-01'),
            estatus: 'activo',
            tipoContrato: 'Indeterminado',
            frecuenciaPago: 'SEMANA',
            salario: 8000.0,
            telefono: '443 512 0565',
            email: '2326244451@agronare.com',
            curp: 'RIDG050307MMNSMDA1',
            nss: '333333333',
            direccion: 'ENEA',
            contactoEmergenciaNombre: '(Mama,Papa,Conyuge, otro familiar)',
            contactoEmergenciaTelefono: '222 222 2222',
            sucursal: 'Oficina Central (Copandaro de Galeana)'
        },
        {
            numeroEmpleado: '2328244153',
            primerNombre: 'Alexis',
            apellidoPaterno: 'Morales',
            departamento: 'Asesor',
            puesto: 'Asesor de ventas',
            fechaIngreso: new Date('2024-01-01'),
            estatus: 'activo',
            tipoContrato: 'Indeterminado',
            frecuenciaPago: 'SEMANA',
            salario: 8000.0,
            telefono: '443 414 5533',
            email: '2328244153@agronare.com',
            curp: 'MAAG00000000000000',
            nss: '444444444',
            direccion: 'ENEA',
            contactoEmergenciaNombre: '(Mama,Papa,Conyuge, otro familiar)',
            contactoEmergenciaTelefono: '333 333 3333',
            sucursal: 'SUC-ZAMORA'
        },
        {
            numeroEmpleado: '2329254454',
            primerNombre: 'Luis Angel',
            apellidoPaterno: 'Garcia',
            apellidoMaterno: 'mendoza',
            departamento: 'Calidad y Control de Procesos',
            puesto: 'Auditor de calidad',
            fechaIngreso: new Date('2024-01-01'),
            estatus: 'activo',
            tipoContrato: 'Indeterminado',
            frecuenciaPago: 'SEMANA',
            salario: 8000.0,
            telefono: '443 414 5533',
            email: '2329254454@agronare.com',
            curp: 'GAML991208HMNRNS09',
            nss: '555555555',
            direccion: 'ENEA',
            contactoEmergenciaNombre: '(Mama,Papa,Conyuge, otro familiar)',
            contactoEmergenciaTelefono: '444 444 4444',
            sucursal: 'Oficina Central (Copandaro de Galeana)'
        },
        {
            numeroEmpleado: '2330254552',
            primerNombre: 'Jose Valentin',
            apellidoPaterno: 'Valencia',
            departamento: 'Asesor',
            puesto: 'Asesor de ventas',
            fechaIngreso: new Date('2024-01-01'),
            estatus: 'activo',
            tipoContrato: 'Indeterminado',
            frecuenciaPago: 'SEMANA',
            salario: 1.0,
            telefono: '443 111 1111',
            email: '2330254552@agronare.com',
            curp: 'VJOS00000000000000',
            nss: '666666666',
            direccion: 'ENEA',
            contactoEmergenciaNombre: '(Mama,Papa,Conyuge, otro familiar)',
            contactoEmergenciaTelefono: '555 555 5555',
            sucursal: 'SUC-CUANAJO'
        },
    ];
    // Crear o actualizar usuarios y empleados
    for (const emp of empleadosData) {
        // Determinar el role basado en el puesto
        let role = 'Usuario';
        if (emp.puesto.includes('CEO') || emp.puesto.includes('Gerente General')) {
            role = 'Gerente General';
        }
        else if (emp.puesto.includes('Director')) {
            role = 'Gerente General';
        }
        else if (emp.puesto.includes('Gerente')) {
            role = 'Gerente de RH';
        }
        else if (emp.puesto.includes('Asesor')) {
            role = 'Asesor Técnico de Ventas';
        }
        // Si ya existe userId (caso del admin), usar ese usuario
        let user;
        if (emp.userId) {
            user = await prisma.user.findUnique({ where: { id: emp.userId } });
        }
        else {
            // Crear o actualizar usuario
            user = await prisma.user.upsert({
                where: { email: emp.email },
                update: {
                    name: `${emp.primerNombre} ${emp.apellidoPaterno}`,
                    role,
                    telefono: emp.telefono,
                    sucursal: emp.sucursal,
                    isActive: emp.estatus === 'activo',
                },
                create: {
                    name: `${emp.primerNombre} ${emp.apellidoPaterno}`,
                    email: emp.email,
                    passwordHash: await bcryptjs_1.default.hash(emp.numeroEmpleado, 10), // usar número de empleado como password inicial
                    role,
                    telefono: emp.telefono,
                    sucursal: emp.sucursal,
                    isActive: emp.estatus === 'activo',
                    verified: true,
                },
            });
        }
        // Crear o actualizar empleado
        await prisma.empleado.upsert({
            where: { userId: user.id },
            update: {
                primerNombre: emp.primerNombre,
                apellidoPaterno: emp.apellidoPaterno,
                apellidoMaterno: emp.apellidoMaterno,
                departamento: emp.departamento,
                puesto: emp.puesto,
                fechaIngreso: emp.fechaIngreso,
                estatus: emp.estatus === 'activo' ? 'Activo' : 'Inactivo',
                tipoContrato: emp.tipoContrato,
                frecuenciaPago: emp.frecuenciaPago.toLowerCase(),
                salario: emp.salario,
                curp: emp.curp,
                nss: emp.nss,
                direccion: emp.direccion,
                contactoEmergenciaNombre: emp.contactoEmergenciaNombre,
                contactoEmergenciaTelefono: emp.contactoEmergenciaTelefono,
            },
            create: {
                userId: user.id,
                primerNombre: emp.primerNombre,
                apellidoPaterno: emp.apellidoPaterno,
                apellidoMaterno: emp.apellidoMaterno,
                departamento: emp.departamento,
                puesto: emp.puesto,
                fechaIngreso: emp.fechaIngreso,
                estatus: emp.estatus === 'activo' ? 'Activo' : 'Inactivo',
                tipoContrato: emp.tipoContrato,
                frecuenciaPago: emp.frecuenciaPago.toLowerCase(),
                salario: emp.salario,
                curp: emp.curp,
                nss: emp.nss,
                direccion: emp.direccion,
                contactoEmergenciaNombre: emp.contactoEmergenciaNombre,
                contactoEmergenciaTelefono: emp.contactoEmergenciaTelefono,
            },
        });
    }
    // ==========================================================================
    // SUCURSALES (SINCRONIZADO CON BRANCHES_MOCK de frontend/constants.ts)
    // ==========================================================================
    console.log('🏢 Creando sucursales...');
    const sucursalesData = [
        {
            nombre: 'Sucursal Zamora',
            codigoInterno: 'SUC-0041',
            estatus: 'Activa',
            responsable: 'Arturo González Neri',
            telefono: '4433000000',
            email: 'suc-zamora@agronare.com',
            horarioAtencion: 'Lunes a Sabado 7:00am a 5:00pm',
            calleNumero: 'El Capricho',
            colonia: 'El Capricho',
            municipio: 'Zamora de Hidalgo',
            estado: 'Michoacán',
            codigoPostal: '59700',
            ubicacion: '59700, El Capricho, 59700 Zamora de Hidalgo, Mich.'
        },
        {
            nombre: 'Sucursal Cuanajo',
            codigoInterno: 'SUC-0043',
            estatus: 'Activa',
            responsable: 'José Valencia',
            telefono: '4431554466',
            email: 'suc-cuanajo@agronare.com',
            horarioAtencion: 'Lunes-sabado 6:00am a 5:00pm',
            calleNumero: 'Guadalupe Victoria 1962',
            colonia: 'Guadalupe Victoria 1962',
            municipio: 'Cuanajo',
            estado: 'Michoacán',
            codigoPostal: '61620',
            ubicacion: 'Guadalupe Victoria 1962, 61620 Cuanajo, Mich.'
        },
        {
            nombre: 'Suc-Central (Copandaro de Galeana)',
            codigoInterno: 'SUC-0042',
            estatus: 'Activa',
            responsable: 'Raúl González Salas',
            telefono: '443 792 4923',
            email: 'suc.copandaro@agronare.com',
            horarioAtencion: 'L-S 9-6',
            calleNumero: 'Cda. de Hidalgo 305',
            colonia: 'Cuartel 4',
            municipio: 'Copándaro de Galeana',
            estado: 'Michoacán',
            codigoPostal: '58870',
            ubicacion: 'Cda. de Hidalgo 305, Cuartel 4, 58870 Copándaro de Galeana, Mich.'
        },
        {
            nombre: 'Oficina Central (Administracion)',
            codigoInterno: 'OFC-CEN',
            estatus: 'Activa',
            responsable: 'Admin System',
            telefono: '443 414 5533',
            email: 'admin@agronare.com',
            horarioAtencion: 'L-S 9-6',
            calleNumero: 'Cda. de Hidalgo 305',
            colonia: 'Cuartel 4',
            municipio: 'Copándaro de Galeana',
            estado: 'Michoacán',
            codigoPostal: '58870',
            ubicacion: 'Cda. de Hidalgo 305, Cuartel 4, 58870 Copándaro de Galeana, Mich.'
        },
    ];
    const sucursales = [];
    for (const s of sucursalesData) {
        // El campo único en Prisma es codigoInterno
        const found = await prisma.sucursal.findUnique({ where: { codigoInterno: s.codigoInterno } });
        const createdOrUpdated = found
            ? await prisma.sucursal.update({ where: { codigoInterno: s.codigoInterno }, data: s })
            : await prisma.sucursal.create({ data: s });
        sucursales.push({ id: createdOrUpdated.id, nombre: createdOrUpdated.nombre });
    }
    // ============================================================================
    // PROVEEDORES (SINCRONIZADO CON INITIAL_SUPPLIERS de constants.ts)
    // ============================================================================
    console.log('🏭 Creando proveedores...');
    const normalizeEmail = (name) => {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
        return `${slug}@agronare.com`;
    };
    const proveedoresData = [
        { nombreEmpresa: 'AGROQUIMICOS LA PLANTA', nombreContacto: 'Contacto La Planta', telefono: '443-100-0001', habilitarCredito: true, credito: 100000, saldoPendiente: 0 },
        { nombreEmpresa: 'ING. JAIME URIEL LOPEZ', nombreContacto: 'Jaime Uriel López', telefono: '443-100-0002', habilitarCredito: false, credito: 0, saldoPendiente: 0 },
        { nombreEmpresa: 'TEPEYAC', nombreContacto: 'Contacto Tepeyac', telefono: '443-100-0003', habilitarCredito: true, credito: 80000, saldoPendiente: 0 },
        { nombreEmpresa: 'COMERCIALIZADORA MEXIMEX', nombreContacto: 'Contacto Meximex', telefono: '443-100-0004', habilitarCredito: true, credito: 150000, saldoPendiente: 0 },
        { nombreEmpresa: 'FERTILIZANTES GOMEZ', nombreContacto: 'Sr. Gómez', telefono: '443-100-0005', habilitarCredito: true, credito: 120000, saldoPendiente: 0 },
        { nombreEmpresa: 'AGROQUIMICA LA ZAMORANA', nombreContacto: 'Contacto La Zamorana', telefono: '443-100-0006', habilitarCredito: true, credito: 90000, saldoPendiente: 0 },
        { nombreEmpresa: 'FOFECHA', nombreContacto: 'Contacto Fofecha', telefono: '443-100-0007', habilitarCredito: false, credito: 0, saldoPendiente: 0 },
        { nombreEmpresa: 'COMERCIALIZADORA DE FERTILIZANTES', nombreContacto: 'Contacto CDF', telefono: '443-100-0008', habilitarCredito: true, credito: 200000, saldoPendiente: 0 },
        { nombreEmpresa: 'EMMANUEL DIAZ BARRIGA PEDRAZA', nombreContacto: 'Emmanuel Díaz Barriga', telefono: '443-100-0009', habilitarCredito: false, credito: 0, saldoPendiente: 0 },
        { nombreEmpresa: 'AGRO PUREPECHA', nombreContacto: 'Contacto Agro Purepecha', telefono: '443-100-0010', habilitarCredito: true, credito: 75000, saldoPendiente: 0 },
        { nombreEmpresa: 'CHEMICAL', nombreContacto: 'Contacto Chemical', telefono: '443-100-0011', habilitarCredito: true, credito: 100000, saldoPendiente: 0 },
        { nombreEmpresa: 'TODO EN RIEGO', nombreContacto: 'Contacto Todo en Riego', telefono: '443-100-0012', habilitarCredito: true, credito: 60000, saldoPendiente: 0 },
        { nombreEmpresa: 'IRCON AGRICOLA', nombreContacto: 'Contacto Ircon', telefono: '443-100-0013', habilitarCredito: true, credito: 85000, saldoPendiente: 0 },
    ].map(p => ({ ...p, email: normalizeEmail(p.nombreEmpresa) }));
    const proveedores = [];
    for (const p of proveedoresData) {
        const exists = await prisma.provider.findFirst({ where: { email: p.email } });
        if (!exists) {
            const created = await prisma.provider.create({ data: p });
            proveedores.push(created);
        }
        else {
            proveedores.push(exists);
        }
    }
    // Datos iniciales: clientes
    const clientes = [
        { nombre: 'Rancho El Sol', telefono: '443-100-2000', email: 'contacto@elsol.mx', rfc: 'ELS030303EF3', direccion: 'Km 12 Carretera Norte' },
        { nombre: 'Agroexport del Bajío', telefono: '443-200-3000', email: 'ventas@agroexport.mx', rfc: 'AEX040404GH4', direccion: 'Parque Industrial 5' },
    ];
    for (const c of clientes) {
        const exists = await prisma.cliente.findFirst({ where: { email: c.email ?? undefined, nombre: c.nombre } });
        if (!exists) {
            await prisma.cliente.create({ data: c });
        }
    }
    console.log('✅ Seed completado:', {
        admin: admin.email,
        empleados: empleadosData.length,
        sucursales: sucursales.map(s => s.nombre),
        proveedores: proveedores.length,
        clientes: clientes.length,
    });
}
main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map