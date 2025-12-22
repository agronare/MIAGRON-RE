# 🎉 Guía de Pruebas - Portal de Facturación AGRONARE

## ✅ Implementación Completa

Se ha implementado exitosamente el sistema completo de facturación con las siguientes funcionalidades:

### Backend
- ✅ Modelos de base de datos (Venta, VentaItem, SolicitudCfdi)
- ✅ API REST con endpoints públicos y privados
- ✅ Servicio de CFDI (integración con FacturAPI)
- ✅ Rate limiting y seguridad
- ✅ Almacenamiento de PDFs en base64

### Frontend ERP
- ✅ Modificación de SalesView.tsx para guardar ventas en BD
- ✅ Generación automática de PDF de tickets
- ✅ Integración completa con backend

### Portal Público
- ✅ Aplicación React independiente
- ✅ Búsqueda de tickets por folio
- ✅ Descarga de tickets PDF
- ✅ Solicitud de CFDI timbrado
- ✅ Consulta de estado de CFDI
- ✅ Descarga de CFDI PDF/XML

---

## 🚀 Sistema Activo

### URLs de Acceso
- **Backend API**: http://localhost:4000
- **ERP Interno**: http://localhost:3001
- **Portal Público**: http://localhost:5174

---

## 🧪 Cómo Probar el Sistema Completo

### Paso 1: Realizar una Venta en el ERP

1. Abrir el ERP en: http://localhost:3001
2. Navegar a la sección de **Ventas** (POS)
3. Agregar productos al carrito
4. Seleccionar:
   - Sucursal
   - Cliente (opcional)
   - Método de pago
   - Marcar "Requiere Factura" si deseas probar CFDI
5. Hacer clic en **Finalizar Venta**
6. **IMPORTANTE**: Anotar el número de folio generado (ej: `VENTA-1234`)

### Paso 2: Verificar en el Portal Público

1. Abrir el portal en: http://localhost:5174
2. Ingresar el número de folio de la venta (ej: `VENTA-1234`)
3. Hacer clic en **Buscar**

### Paso 3: Descargar Ticket PDF

1. En la vista de la factura, hacer clic en **Descargar PDF**
2. Verificar que el PDF contiene:
   - Información de la empresa (AGRONARE)
   - Número de folio
   - Fecha y hora
   - Cliente
   - Productos comprados
   - Totales (subtotal, IVA, total)
   - Método de pago

### Paso 4: Solicitar CFDI (Opcional)

1. En la vista de la factura, hacer clic en **Solicitar CFDI**
2. Ingresar:
   - Email del cliente
   - Teléfono (opcional)
   - Notas adicionales (opcional)
3. Hacer clic en **Solicitar Factura**
4. Verificar mensaje de confirmación
5. Recargar la página después de unos segundos
6. Verificar que el estado cambió a "CFDI en Proceso"

---

## 🔍 Verificaciones en Base de Datos

### Ver ventas guardadas

```bash
cd backend
npx prisma studio
```

En Prisma Studio:
1. Ir a la tabla **Venta**
2. Verificar que la venta aparece con todos los datos
3. Ver el campo `ticketPdfBase64` (debería contener el PDF en base64)
4. Ir a la tabla **VentaItem**
5. Verificar que los items de la venta están guardados

### Consultar venta desde consola

```bash
# Desde la raíz del proyecto backend
cd backend
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.venta.findMany({
  include: { items: true },
  take: 5,
  orderBy: { createdAt: 'desc' }
}).then(ventas => {
  console.log('Últimas 5 ventas:');
  ventas.forEach(v => {
    console.log(\`\${v.folio} - \${v.clienteNombre} - $\${v.total}\`);
  });
  prisma.\$disconnect();
});
"
```

---

## 🧪 Pruebas de API (con curl)

### 1. Buscar ticket por folio

```bash
curl http://localhost:4000/api/ventas/public/ticket/VENTA-1234
```

Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "folio": "VENTA-1234",
    "clienteNombre": "Juan P***",
    "fecha": "2025-01-15T10:30:00.000Z",
    "total": 1500.50,
    ...
  }
}
```

### 2. Descargar ticket PDF

```bash
curl -o ticket.pdf http://localhost:4000/api/ventas/public/ticket/VENTA-1234/pdf
```

### 3. Solicitar CFDI

```bash
curl -X POST http://localhost:4000/api/ventas/public/cfdi/request \
  -H "Content-Type: application/json" \
  -d '{
    "folio": "VENTA-1234",
    "clienteEmail": "cliente@ejemplo.com",
    "clienteTelefono": "5512345678"
  }'
```

### 4. Consultar estado de CFDI

```bash
curl http://localhost:4000/api/ventas/public/cfdi/status/VENTA-1234
```

---

## 🐛 Solución de Problemas

### Error: "No se encontró el ticket"

**Causa**: El folio no existe en la base de datos o fue escrito incorrectamente.

**Solución**:
1. Verificar que se haya realizado una venta en el ERP
2. Copiar el folio exactamente como aparece
3. Verificar en Prisma Studio que la venta existe

### Error: "Failed to fetch" en el frontend

**Causa**: El backend no está corriendo o hay problema de conexión.

**Solución**:
```bash
# Verificar que el backend esté corriendo
curl http://localhost:4000/health

# Si no responde, reiniciar backend
cd backend
npm run dev
```

### PDF no se descarga

**Causa**: El PDF no se generó o no se guardó correctamente.

**Solución**:
1. Verificar en la consola del navegador si hay errores
2. Verificar en Prisma Studio que el campo `ticketPdfBase64` no esté vacío
3. Revisar logs del backend en la terminal

### Error al guardar venta en backend

**Causa**: Error en la API o validación de datos.

**Solución**:
1. Abrir la consola del navegador (F12)
2. Ver el error específico en la pestaña Console
3. Verificar que el backend esté respondiendo
4. Revisar logs del backend en la terminal

---

## 📊 Datos de Prueba

### Folios de Ejemplo

Los folios se generan automáticamente con el formato: `VENTA-XXXX` donde XXXX es un número aleatorio entre 1000 y 9999.

### Clientes de Prueba

Puedes crear clientes desde el ERP o usar "Público General" (sin seleccionar cliente).

---

## 🔐 Configuración de FacturAPI (Para CFDI Real)

Actualmente el sistema está configurado en modo TEST. Para producción:

1. Crear cuenta en https://www.facturapi.io/
2. Obtener API Key de producción
3. Actualizar [backend/.env](backend/.env):
   ```env
   CFDI_PAC_API_KEY=tu_api_key_produccion
   CFDI_MODO=production
   ```
4. Configurar datos fiscales reales:
   ```env
   COMPANY_RFC=TU_RFC_REAL
   COMPANY_RAZON_SOCIAL=Tu Razón Social Real
   COMPANY_REGIMEN_FISCAL=601
   COMPANY_CP=58880
   ```

---

## 📝 Checklist de Pruebas

- [ ] Backend corriendo en puerto 4000
- [ ] ERP corriendo en puerto 3001
- [ ] Portal corriendo en puerto 5174
- [ ] Base de datos PostgreSQL activa
- [ ] Realizar venta en ERP
- [ ] Venta se guarda en BD (verificar en Prisma Studio)
- [ ] PDF se genera y guarda en base64
- [ ] Buscar ticket en portal público
- [ ] Descargar ticket PDF
- [ ] Solicitar CFDI (opcional)
- [ ] Ver estado de CFDI
- [ ] Descargar CFDI PDF/XML (cuando esté timbrado)

---

## 🎯 Próximos Pasos

1. **Configurar FacturAPI Real**: Registrarse y obtener credenciales de producción
2. **Worker de CFDI**: Implementar procesamiento automático de solicitudes pendientes
3. **Notificaciones por Email**: Enviar emails cuando el CFDI esté listo
4. **Analytics**: Agregar métricas de uso del portal
5. **Despliegue**: Configurar para producción (Nginx, dominio, SSL)

---

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:
1. Revisar los logs del backend en la terminal
2. Revisar la consola del navegador (F12)
3. Verificar Prisma Studio para datos de BD
4. Documentación de FacturAPI: https://docs.facturapi.io

---

**¡Sistema Listo para Pruebas! 🎉**
