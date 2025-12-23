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

## ✅ Variables de Entorno Configuradas

### Variables YA Configuradas:

**Backend:**
- ✅ `JWT_SECRET` - Configurado con valor seguro
- ✅ `CORS_ORIGINS` - Configurado con URLs de Vercel
- ⚠️ `DATABASE_URL` - **TEMPORAL - DEBES ACTUALIZARLO**

**Frontend:**
- ✅ `VITE_BACKEND_URL` - https://backend-ten-iota-99.vercel.app/api

**Portal:**
- ✅ `VITE_API_URL` - https://backend-ten-iota-99.vercel.app/api

---

## ⚠️ CRÍTICO: Actualizar Base de Datos

El backend actualmente tiene un `DATABASE_URL` temporal que **NO FUNCIONA**. Necesitas:

### 1. Crear Base de Datos PostgreSQL

**Opción A - Neon (Recomendado - Gratis):**
1. Ve a https://neon.tech
2. Crea una cuenta
3. Crea un nuevo proyecto
4. Copia la Connection String

**Opción B - Supabase (Gratis):**
1. Ve a https://supabase.com
2. Crea un proyecto
3. Ve a Settings → Database
4. Copia la Connection String (modo "Connection pooling")

**Opción C - Railway:**
1. Ve a https://railway.app
2. Crea un proyecto PostgreSQL
3. Copia la Connection String

### 2. Actualizar DATABASE_URL en Vercel

Ve a: https://vercel.com/agronares-projects/backend/settings/environment-variables

1. Busca `DATABASE_URL`
2. Click en "Edit"
3. Reemplaza con tu URL real de PostgreSQL
4. Guarda los cambios

### 3. Aplicar Migraciones de Prisma

```bash
cd backend
DATABASE_URL="tu-url-real" npx prisma migrate deploy
```

### 4. Re-desplegar el Backend

```bash
cd backend
vercel --prod
```

---

## ⚠️ OPCIONAL: Configurar FacturAPI

Si necesitas facturación electrónica, agrega estas variables en el backend:

Ve a: https://vercel.com/agronares-projects/backend/settings/environment-variables

```bash
CFDI_PAC_PROVIDER=facturapi
CFDI_PAC_API_KEY=sk_live_xxxxx
CFDI_PAC_SECRET=xxxxx
CFDI_MODO=production
COMPANY_RFC=AGR230616K40
COMPANY_RAZON_SOCIAL=AGRONARE
COMPANY_REGIMEN_FISCAL=601
COMPANY_CP=58880
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
