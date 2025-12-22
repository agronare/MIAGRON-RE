# 🚀 Guía de Despliegue en Vercel - MIAGRON-RE

## 📋 Pre-requisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Vercel CLI instalado (ya está instalado)
3. Base de datos PostgreSQL en producción (recomendaciones):
   - [Neon](https://neon.tech) - Gratis, serverless
   - [Supabase](https://supabase.com) - Gratis, incluye más servicios
   - [Railway](https://railway.app) - Fácil de usar

---

## 🔐 SEGURIDAD: Variables de Entorno

### ⚠️ NUNCA subas archivos .env a Git

Los archivos `.env` ya están protegidos por `.gitignore`. Verifica antes de hacer commit:

```bash
git status
```

Los archivos `.env` NO deben aparecer en la lista.

---

## 📦 Orden de Despliegue

### 1️⃣ BACKEND (Primero)

#### Paso 1: Preparar la base de datos

Crea una base de datos PostgreSQL en producción (ej: Neon, Supabase).

#### Paso 2: Construir el backend

```bash
cd backend
npm install
npm run build
```

#### Paso 3: Desplegar con Vercel CLI

```bash
cd backend
vercel
```

Sigue el asistente:
- **Set up and deploy**: Yes
- **Which scope**: Tu cuenta/organización
- **Link to existing project**: No
- **Project name**: `agronare-backend` (o el nombre que prefieras)
- **Directory**: `./` (enter)
- **Override settings**: No

#### Paso 4: Configurar variables de entorno en Vercel

**Opción A: Desde el Dashboard de Vercel**
1. Ve a tu proyecto en https://vercel.com/dashboard
2. Settings → Environment Variables
3. Agrega cada variable de `.env.production.example`:

Variables CRÍTICAS a configurar:
```
DATABASE_URL=postgresql://...  (tu URL de producción)
JWT_SECRET=<genera-uno-seguro>
CORS_ORIGINS=https://tu-frontend.vercel.app,https://tu-portal.vercel.app
CFDI_PAC_API_KEY=sk_live_xxxxx
CFDI_PAC_SECRET=xxxxx
CFDI_MODO=production
```

**Opción B: Desde la CLI**
```bash
vercel env add DATABASE_URL production
# Pega el valor cuando lo pida
```

#### Paso 5: Re-desplegar con las variables

```bash
vercel --prod
```

**Guarda la URL del backend**: https://agronare-backend.vercel.app

---

### 2️⃣ FRONTEND (Dashboard Principal)

#### Paso 1: Actualizar la variable de entorno

Crea el archivo `frontend/.env.production` (NO lo subas a Git):

```bash
VITE_BACKEND_URL=https://agronare-backend.vercel.app/api
```

#### Paso 2: Desplegar

```bash
cd frontend
vercel
```

Configuración:
- **Project name**: `agronare-dashboard`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### Paso 3: Configurar variables de entorno en Vercel

En el Dashboard o con CLI:
```bash
vercel env add VITE_BACKEND_URL production
# Valor: https://agronare-backend.vercel.app/api
```

#### Paso 4: Desplegar a producción

```bash
vercel --prod
```

---

### 3️⃣ PORTAL (Facturación)

#### Paso 1: Actualizar la variable de entorno

Crea el archivo `portal/.env.production`:

```bash
VITE_API_URL=https://agronare-backend.vercel.app/api
```

#### Paso 2: Desplegar

```bash
cd portal
vercel
```

Configuración:
- **Project name**: `agronare-portal`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### Paso 3: Configurar variables de entorno

```bash
vercel env add VITE_API_URL production
# Valor: https://agronare-backend.vercel.app/api
```

#### Paso 4: Desplegar a producción

```bash
vercel --prod
```

---

## 🔄 Actualizar CORS en el Backend

Una vez tengas las URLs de producción del frontend y portal, actualiza el CORS:

1. Ve al Dashboard de Vercel → Backend Project → Settings → Environment Variables
2. Actualiza `CORS_ORIGINS` con las URLs reales:
   ```
   https://agronare-dashboard.vercel.app,https://agronare-portal.vercel.app
   ```
3. Re-despliega el backend:
   ```bash
   cd backend
   vercel --prod
   ```

---

## 🗄️ Migraciones de Base de Datos

Para aplicar el schema de Prisma a tu base de datos de producción:

```bash
cd backend
DATABASE_URL="<tu-url-de-produccion>" npm run prisma:migrate:prod
```

O manualmente:
```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

---

## ✅ Verificación

### Backend
```bash
curl https://agronare-backend.vercel.app/health
# Debe retornar: {"ok":true,"env":"production"}
```

### Frontend y Portal
Abre en el navegador:
- Frontend: https://agronare-dashboard.vercel.app
- Portal: https://agronare-portal.vercel.app

Verifica que puedan comunicarse con el backend.

---

## 🔒 Checklist de Seguridad

- [ ] Archivos `.env` en `.gitignore` y NO subidos a Git
- [ ] `JWT_SECRET` es un valor seguro y único (no `dev-secret-change`)
- [ ] `DATABASE_URL` apunta a base de datos de producción
- [ ] CORS configurado solo para tus dominios de Vercel
- [ ] Credenciales de FacturAPI son de producción (`sk_live_...`)
- [ ] `CFDI_MODO=production`
- [ ] Headers de seguridad configurados (ya están en `vercel.json`)

---

## 📱 Comandos Rápidos

### Re-desplegar todo después de cambios

```bash
# Backend
cd backend && npm run build && vercel --prod

# Frontend
cd frontend && vercel --prod

# Portal
cd portal && vercel --prod
```

### Ver logs de producción

```bash
vercel logs <project-url> --follow
```

### Eliminar un despliegue

```bash
vercel remove <deployment-url>
```

---

## 🆘 Troubleshooting

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` esté configurada en Vercel
- Verifica que la base de datos permita conexiones externas
- Usa la URL de conexión externa (no localhost)

### Error: "CORS blocked"
- Verifica que `CORS_ORIGINS` incluya las URLs correctas
- Re-despliega el backend después de cambiar CORS

### Error: "Environment variable not found"
- Las variables con prefijo `VITE_` deben estar en tiempo de build
- Re-despliega después de agregar variables de entorno

### Backend no encuentra archivos después de build
- Vercel usa un sistema de archivos de solo lectura
- Considera usar S3 o similar para `uploads/` en producción

---

## 🌟 Mejoras Post-Despliegue

1. **Dominio personalizado**: Configura dominios custom en Vercel Settings
2. **Monitoreo**: Activa Vercel Analytics
3. **Storage**: Configura S3/Cloudinary para archivos uploaded
4. **CI/CD**: Conecta el repo de GitHub para despliegues automáticos
5. **Preview Deployments**: Habilita deploys de preview para PRs

---

## 📞 Soporte

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Prisma Docs: https://www.prisma.io/docs

---

¡Listo! Tu aplicación MIAGRON-RE está desplegada de forma segura en Vercel. 🎉
