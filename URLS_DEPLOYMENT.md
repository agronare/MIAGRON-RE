# 🚀 URLs de Despliegue - MIAGRON-RE

## ✅ Aplicaciones Desplegadas

### 🔧 Backend API
- **URL Principal**: https://backend-ten-iota-99.vercel.app
- **URL de Deployment**: https://backend-ec2uaifcz-agronares-projects.vercel.app
- **Health Check**: https://backend-ten-iota-99.vercel.app/health
- **API Base**: https://backend-ten-iota-99.vercel.app/api
- **Dashboard Vercel**: https://vercel.com/agronares-projects/backend

### 🖥️ Frontend (Dashboard Principal)
- **URL Principal**: https://frontend-seven-theta-28.vercel.app
- **URL de Deployment**: https://frontend-3ev7d1qca-agronares-projects.vercel.app
- **Dashboard Vercel**: https://vercel.com/agronares-projects/frontend

### 💳 Portal (Facturación)
- **URL Principal**: https://portal-seven-orpin.vercel.app
- **URL de Deployment**: https://portal-dhutnp2oy-agronares-projects.vercel.app
- **Dashboard Vercel**: https://vercel.com/agronares-projects/portal

---

## ⚠️ IMPORTANTE: Configuración Pendiente

### 1. Variables de Entorno del Backend

Ve a: https://vercel.com/agronares-projects/backend/settings/environment-variables

Agrega las siguientes variables para **Production**:

```bash
# Base de Datos (CRÍTICO)
DATABASE_URL=postgresql://usuario:password@host:5432/database?schema=public

# JWT (CRÍTICO - generar uno seguro)
JWT_SECRET=<ejecuta: openssl rand -base64 32>

# CORS (actualizar con URLs reales)
CORS_ORIGINS=https://frontend-seven-theta-28.vercel.app,https://portal-seven-orpin.vercel.app

# FacturAPI (credenciales de producción)
CFDI_PAC_PROVIDER=facturapi
CFDI_PAC_API_KEY=sk_live_xxxxx
CFDI_PAC_SECRET=xxxxx
CFDI_MODO=production

# Datos fiscales de la empresa
COMPANY_RFC=AGR230616K40
COMPANY_RAZON_SOCIAL=AGRONARE
COMPANY_REGIMEN_FISCAL=601
COMPANY_CP=58880

# Opcionales pero recomendadas
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

### 2. Variables de Entorno del Frontend

Ve a: https://vercel.com/agronares-projects/frontend/settings/environment-variables

Agrega:
```bash
VITE_BACKEND_URL=https://backend-ten-iota-99.vercel.app/api
```

### 3. Variables de Entorno del Portal

Ve a: https://vercel.com/agronares-projects/portal/settings/environment-variables

Agrega:
```bash
VITE_API_URL=https://backend-ten-iota-99.vercel.app/api
```

---

## 🔄 Pasos Siguientes

### 1. Configurar Base de Datos de Producción

Crea una base de datos PostgreSQL:
- [Neon](https://neon.tech) - Gratis, serverless ✅ Recomendado
- [Supabase](https://supabase.com) - Gratis
- [Railway](https://railway.app)

### 2. Aplicar Migraciones de Prisma

```bash
cd backend
DATABASE_URL="<tu-url-de-produccion>" npx prisma migrate deploy
```

### 3. Re-desplegar después de configurar variables

Una vez configuradas las variables de entorno:

```bash
# Backend
cd backend
vercel --prod

# Frontend
cd frontend
vercel --prod

# Portal
cd portal
vercel --prod
```

O usa el script:
```bash
./deploy.sh all
```

---

## 🧪 Verificación

### Backend
```bash
curl https://backend-ten-iota-99.vercel.app/health
# Debe retornar: {"ok":true,"env":"production"}
```

### Frontend
Abre: https://frontend-seven-theta-28.vercel.app

### Portal
Abre: https://portal-seven-orpin.vercel.app

---

## 🔒 Checklist de Seguridad Post-Despliegue

- [ ] Configurar `DATABASE_URL` con base de datos de producción
- [ ] Cambiar `JWT_SECRET` a un valor seguro (NO usar 'dev-secret-change')
- [ ] Actualizar `CORS_ORIGINS` con las URLs de Vercel
- [ ] Configurar credenciales de FacturAPI de producción (`sk_live_...`)
- [ ] Cambiar `CFDI_MODO` a `production`
- [ ] Aplicar migraciones de Prisma a la base de datos
- [ ] Re-desplegar las 3 aplicaciones
- [ ] Verificar que el frontend se conecte al backend
- [ ] Verificar que el portal se conecte al backend
- [ ] Verificar que no hay errores de CORS en la consola

---

## 📊 Monitoreo

- **Backend Logs**: `vercel logs https://backend-ten-iota-99.vercel.app --follow`
- **Frontend Logs**: `vercel logs https://frontend-seven-theta-28.vercel.app --follow`
- **Portal Logs**: `vercel logs https://portal-seven-orpin.vercel.app --follow`

---

## 🌐 Dominios Personalizados (Opcional)

Para configurar dominios personalizados:

1. Ve al Dashboard de cada proyecto
2. Settings → Domains
3. Agrega tu dominio personalizado

Ejemplo:
- Backend: `api.agronare.com`
- Frontend: `app.agronare.com`
- Portal: `facturacion.agronare.com`

---

## 🆘 Soporte

- Ver logs detallados en el Dashboard de Vercel
- [Documentación de Vercel](https://vercel.com/docs)
- [DESPLIEGUE_VERCEL.md](./DESPLIEGUE_VERCEL.md) - Guía completa
- [CHECKLIST_SEGURIDAD.md](./CHECKLIST_SEGURIDAD.md) - Checklist de seguridad

---

Fecha de despliegue: 2025-12-22
