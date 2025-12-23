# 🚂 Guía Paso a Paso: Desplegar Backend en Railway

## ✅ Pre-requisitos
- Cuenta de GitHub
- Repositorio MIAGRON-RE en GitHub

---

## 📝 Paso 1: Crear cuenta en Railway

1. Ve a: **https://railway.app**
2. Click en **"Start a New Project"**
3. Selecciona **"Login with GitHub"**
4. Autoriza Railway para acceder a tus repositorios

---

## 🚀 Paso 2: Crear nuevo proyecto

1. En el Dashboard de Railway, click **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Busca y selecciona **`MIAGRON-RE`**
4. Railway detectará automáticamente el proyecto

---

## ⚙️ Paso 3: Configurar el servicio Backend

### 3.1 Configurar Root Directory

1. Click en el servicio que se creó
2. Ve a **Settings** (⚙️)
3. Busca **"Root Directory"**
4. Cambia a: **`backend`**
5. Click **"Update"**

### 3.2 Configurar Build Command

En Settings, busca **"Build Command"** y configura:
```
npm install && npm run build
```

### 3.3 Configurar Start Command

En Settings, busca **"Start Command"** y configura:
```
npm start
```

---

## 🔐 Paso 4: Agregar Variables de Entorno

1. En el servicio, ve a **Variables** (tab)
2. Click **"New Variable"**
3. Agrega cada una de estas variables:

### Variables requeridas:

**DATABASE_URL**
```
postgresql://neondb_owner:npg_Vzr8WfiX5OTx@ep-lucky-wave-ahq1f3a8-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**JWT_SECRET**
```
J+QdpyGwQuhZgt4+hyxDnO7HMki4LBhEHcetvzV1t60=
```

**CORS_ORIGINS**
```
https://frontend-seven-theta-28.vercel.app,https://portal-seven-orpin.vercel.app
```

**NODE_ENV**
```
production
```

**PORT** (Railway lo asigna automáticamente, pero puedes agregarlo)
```
${{PORT}}
```

### Variables opcionales:

**RATE_LIMIT_WINDOW_MS**
```
900000
```

**RATE_LIMIT_MAX**
```
200
```

---

## 🎯 Paso 5: Deploy

1. Una vez agregadas todas las variables, Railway automáticamente iniciará el deploy
2. Espera 2-3 minutos a que compile
3. Verás el progreso en la sección **"Deployments"**

---

## 🌐 Paso 6: Obtener la URL pública

1. Ve a **Settings**
2. Busca **"Networking"**
3. Click en **"Generate Domain"**
4. Railway te dará una URL como: `https://tu-proyecto.up.railway.app`

**Copia esta URL** - la necesitarás para actualizar el frontend y portal.

---

## ✅ Paso 7: Verificar que funciona

Abre en tu navegador:
```
https://TU-URL-DE-RAILWAY.up.railway.app/health
```

Deberías ver:
```json
{"ok":true,"env":"production"}
```

---

## 🔄 Paso 8: Actualizar Frontend y Portal

Una vez que tengas la URL de Railway (ej: `https://agronare-backend.up.railway.app`):

### 8.1 Actualizar Frontend en Vercel

1. Ve a: https://vercel.com/agronares-projects/frontend/settings/environment-variables
2. Busca `VITE_BACKEND_URL`
3. Click **"Edit"**
4. Cambia a: `https://TU-URL-RAILWAY.up.railway.app/api`
5. Guarda

### 8.2 Actualizar Portal en Vercel

1. Ve a: https://vercel.com/agronares-projects/portal/settings/environment-variables
2. Busca `VITE_API_URL`
3. Click **"Edit"**
4. Cambia a: `https://TU-URL-RAILWAY.up.railway.app/api`
5. Guarda

### 8.3 Re-desplegar Frontend y Portal

```bash
cd /workspaces/MIAGRON-RE/frontend
vercel --prod

cd /workspaces/MIAGRON-RE/portal
vercel --prod
```

---

## 🎉 Paso 9: ¡Listo!

Tu aplicación completa ahora está funcionando:

- ✅ **Frontend**: https://frontend-seven-theta-28.vercel.app
- ✅ **Portal**: https://portal-seven-orpin.vercel.app
- ✅ **Backend**: https://TU-URL-RAILWAY.up.railway.app
- ✅ **Database**: Neon PostgreSQL

---

## 💰 Costos

Railway ofrece:
- **$5 USD gratis/mes** (suficiente para desarrollo y pruebas)
- Sin tarjeta de crédito requerida inicialmente
- Facturación por uso después del crédito gratis

---

## 🆘 Troubleshooting

### El deploy falla con error de build

**Solución**: Verifica que el Root Directory esté en `backend`

### Error de conexión a base de datos

**Solución**: Verifica que `DATABASE_URL` esté correctamente copiada (sin espacios extra)

### CORS errors en el frontend

**Solución**:
1. Verifica que `CORS_ORIGINS` incluya las URLs correctas
2. Actualiza el backend en Railway si cambiaste las URLs

### Timeout en health check

**Solución**: Railway puede tardar 1-2 minutos en el primer deploy. Espera y refresca.

---

## 📞 Links Útiles

- [Railway Dashboard](https://railway.app/dashboard)
- [Railway Docs](https://docs.railway.app)
- [Neon Dashboard](https://console.neon.tech)
- [Vercel Dashboard](https://vercel.com/dashboard)

---

¡Tu aplicación AGRONARE está lista para producción! 🌾
