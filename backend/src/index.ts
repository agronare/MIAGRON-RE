import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const prisma = new PrismaClient();

// Config
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 100),
});
// Respetar cabeceras X-Forwarded-* cuando corremos detrás de proxy (p.ej. devcontainers)
const TRUST_PROXY = (process.env.TRUST_PROXY || 'true').toLowerCase() === 'true';
app.set('trust proxy', TRUST_PROXY ? 1 : false);

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ORIGINS }));
app.use(helmet());
app.use(morgan('dev'));
app.use(limiter);

// Health
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

// Base API router
const api = express.Router();

// Simple generic list route for sanity
api.get('/status', async (_req, res) => {
  const tables = ['User', 'Empleado', 'Sucursal', 'Product', 'Provider', 'Inventario'];
  res.json({ ok: true, tables });
});

// Import routers
import productsRouter from './modules/erp/products.router';
import providersRouter from './modules/erp/providers.router';
import sucursalesRouter from './modules/rh/sucursales.router';
import inventarioMovimientosRouter from './modules/erp/inventarioMovimientos.router';
import inventarioRouter from './modules/erp/inventario.router';
import quotesRouter from './modules/erp/quotes.router';
import quoteItemsRouter from './modules/erp/quoteItems.router';
import abonosProveedorRouter from './modules/erp/abonosProveedor.router';
import purchasesRouter from './modules/erp/purchases.router';
import purchaseItemsRouter from './modules/erp/purchaseItems.router';
import activosRouter from './modules/erp/activos.router';
import ventasRouter from './modules/erp/ventas.router';
import clientesRouter from './modules/crm/clientes.router';
import creditosRouter from './modules/crm/creditos.router';
import abonosRouter from './modules/crm/abonos.router';
import oportunidadesRouter from './modules/crm/oportunidades.router';
import verificacionesRouter from './modules/crm/verificaciones.router';
import usersRouter from './modules/rh/users.router';
import empleadosRouter from './modules/rh/empleados.router';
import periodosRouter from './modules/rh/periodos.router';
import incidenciasRouter from './modules/rh/incidencias.router';
import vehiculosRouter from './modules/logistics/vehiculos.router';
import viajesRouter from './modules/logistics/viajes.router';
import entregasRouter from './modules/logistics/entregas.router';
import recoleccionesRouter from './modules/logistics/recolecciones.router';
import mantenimientosRouter from './modules/logistics/mantenimientos.router';
import mantenimientosProgRouter from './modules/logistics/mantenimientosProgramados.router';
import reportesDiariosRouter from './modules/logistics/reportesDiarios.router';
import itinerariosRouter from './modules/logistics/itinerarios.router';
import paradasRouter from './modules/logistics/paradas.router';
import planesRutaRouter from './modules/logistics/planesRuta.router';
import visitasRouter from './modules/logistics/visitas.router';
import botsRouter from './modules/rpa/bots.router';
import botLogsRouter from './modules/rpa/botLogs.router';
import schedulesRouter from './modules/rpa/schedules.router';
import movimientosRouter from './modules/finance/movimientos.router';
import asesoriasRouter from './modules/finance/asesorias.router';
import corteCajaRouter from './modules/finance/corteCaja.router';

api.use('/products', productsRouter);
api.use('/providers', providersRouter);
api.use('/sucursales', sucursalesRouter);
api.use('/inventario', inventarioRouter);
api.use('/inventario-movimientos', inventarioMovimientosRouter);
api.use('/abonos-proveedor', abonosProveedorRouter);
api.use('/quotes', quotesRouter);
api.use('/quote-items', quoteItemsRouter);
api.use('/purchases', purchasesRouter);
api.use('/purchase-items', purchaseItemsRouter);
api.use('/activos', activosRouter);
api.use('/ventas', ventasRouter);
api.use('/clientes', clientesRouter);
api.use('/creditos', creditosRouter);
api.use('/abonos-cliente', abonosRouter);
api.use('/oportunidades', oportunidadesRouter);
api.use('/cliente-verificaciones', verificacionesRouter);
api.use('/users', usersRouter);
api.use('/empleados', empleadosRouter);
api.use('/periodos-nomina', periodosRouter);
api.use('/incidencias-nomina', incidenciasRouter);
api.use('/vehiculos', vehiculosRouter);
api.use('/viajes', viajesRouter);
api.use('/entregas', entregasRouter);
api.use('/recolecciones', recoleccionesRouter);
api.use('/mantenimientos', mantenimientosRouter);
api.use('/mantenimientos-programados', mantenimientosProgRouter);
api.use('/vehiculo-reportes-diarios', reportesDiariosRouter);
api.use('/itinerarios', itinerariosRouter);
api.use('/paradas', paradasRouter);
api.use('/planes-ruta', planesRutaRouter);
api.use('/visitas', visitasRouter);
api.use('/bots', botsRouter);
api.use('/bot-logs', botLogsRouter);
api.use('/rpa-schedules', schedulesRouter);
api.use('/movimientos-financieros', movimientosRouter);
api.use('/asesorias', asesoriasRouter);
api.use('/corte-caja', corteCajaRouter);

app.use('/api', api);

// Proxy Prisma Studio bajo /prisma para acceder vía el puerto del backend (p.ej. 4000)
// Útil en entornos con restricciones de port forwarding (Codespaces).
app.use(
  '/prisma',
  createProxyMiddleware({
    target: 'http://127.0.0.1:5555',
    changeOrigin: true,
    ws: true,
    pathRewrite: { '^/prisma': '' },
    onProxyReq: (proxyReq, req, _res) => {
      // Asegura cabeceras útiles cuando corremos detrás de proxy
      proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
    },
  })
);

app.listen(PORT, () => {
  console.log(`🌾 AGRONARE API escuchando en http://localhost:${PORT}/api`);
  console.log(`🔎 Prisma Studio accesible via http://localhost:${PORT}/prisma`);
});
