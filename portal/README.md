# Portal Público de Facturación - AGRONARE

Portal web público para que los clientes puedan descargar sus facturas usando el número de ticket de compra.

## Características

- ✅ Búsqueda de tickets por número de folio
- ✅ Descarga inmediata de tickets PDF
- ✅ Solicitud de CFDI timbrado (factura fiscal)
- ✅ Consulta de estado de CFDI
- ✅ Descarga de CFDI PDF y XML
- ✅ Interfaz responsive con Tailwind CSS
- ✅ Rate limiting en API pública

## Tecnologías

- **React 19** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos

## Instalación

```bash
# Instalar dependencias
npm install

# Modo desarrollo (puerto 5174)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:4000/api
```

### Backend

El portal se conecta al backend en `http://localhost:4000/api`. Asegúrese de que:

1. El backend esté corriendo en el puerto 4000
2. CORS esté configurado para permitir `http://localhost:5174`
3. Las rutas públicas de ventas estén disponibles

## Estructura del Proyecto

```
portal/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes React
│   │   ├── InvoiceViewer.tsx       # Visualizador de factura
│   │   ├── DownloadButtons.tsx     # Botones de descarga
│   │   ├── CFDIRequestForm.tsx     # Formulario solicitud CFDI
│   │   └── ErrorMessage.tsx        # Mensaje de error
│   ├── services/
│   │   └── portalApi.ts            # Cliente API
│   ├── types.ts         # TypeScript types
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Punto de entrada
│   └── index.css        # Estilos Tailwind
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Flujo de Usuario

1. **Búsqueda**: Usuario ingresa número de ticket (ej: `VENTA-1234`)
2. **Visualización**: Se muestra la información de la compra
3. **Descarga Ticket**: Descarga inmediata del PDF simple
4. **Solicitud CFDI** (opcional):
   - Usuario ingresa email y datos adicionales
   - Sistema crea solicitud (estado: "solicitado")
   - Backend procesa timbrado (24-48 horas)
   - Usuario recibe notificación por email
   - Usuario puede descargar CFDI PDF y XML

## Endpoints API Utilizados

### Públicos (sin autenticación)

- `GET /api/ventas/public/ticket/:folio` - Buscar ticket
- `GET /api/ventas/public/ticket/:folio/pdf` - Descargar ticket PDF
- `POST /api/ventas/public/cfdi/request` - Solicitar CFDI
- `GET /api/ventas/public/cfdi/status/:folio` - Estado CFDI
- `GET /api/ventas/public/cfdi/download/:folio/pdf` - Descargar CFDI PDF
- `GET /api/ventas/public/cfdi/download/:folio/xml` - Descargar CFDI XML

## Seguridad

- **Rate Limiting**: 20 requests/15min para endpoints generales
- **Rate Limiting CFDI**: 5 requests/hora para solicitudes de timbrado
- **Validación de Folio**: Formato `VENTA-\d+` requerido
- **Ocultamiento de datos**: RFC y nombres parcialmente ocultos en respuestas públicas

## Próximos Pasos

1. Configurar FacturAPI con credenciales reales
2. Implementar worker/cron para procesamiento automático de CFDIs
3. Sistema de notificaciones por email
4. Agregar analytics de uso del portal
5. Implementar caché de Redis para PDFs generados

## Despliegue

### Desarrollo

```bash
npm run dev
```

Acceder a: http://localhost:5174

### Producción

```bash
npm run build
```

Los archivos estáticos se generan en `dist/`. Servir con:
- Nginx
- Vercel
- Netlify
- Cualquier servidor de archivos estáticos

### Configuración Nginx (Ejemplo)

```nginx
server {
  server_name facturacion.agronare.com;
  root /var/www/portal/dist;

  location / {
    try_files $uri /index.html;
  }

  # Proxy a backend API
  location /api {
    proxy_pass http://localhost:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## Soporte

Para problemas o preguntas, contactar al equipo de desarrollo de AGRONARE.
