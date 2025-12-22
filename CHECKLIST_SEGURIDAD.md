# 🔒 Checklist de Seguridad Pre-Despliegue

## ⚠️ ANTES de desplegar a Vercel

### 1. Variables de Entorno

- [ ] **NO subir archivos `.env` a Git**
  ```bash
  git status
  # Los archivos .env NO deben aparecer
  ```

- [ ] **Generar JWT_SECRET seguro**
  ```bash
  openssl rand -base64 32
  # Usa este valor en Vercel, NO uses 'dev-secret-change'
  ```

- [ ] **Verificar que .gitignore incluya:**
  - `.env`
  - `.env.local`
  - `.env.*.local`
  - `.env.production`
  - `.vercel`

### 2. Base de Datos

- [ ] **Usar base de datos de PRODUCCIÓN** (no localhost)
  - Opciones: Neon, Supabase, Railway, PlanetScale

- [ ] **DATABASE_URL debe usar conexión externa**
  - ❌ `postgresql://localhost:5432/...`
  - ✅ `postgresql://usuario:password@host-externo:5432/...`

- [ ] **Aplicar migraciones de Prisma a producción**
  ```bash
  DATABASE_URL="tu-url-produccion" npm run prisma:migrate:prod
  ```

### 3. Credenciales de FacturAPI

- [ ] **Cambiar a credenciales de PRODUCCIÓN**
  - ❌ `CFDI_PAC_API_KEY=sk_test_xxxxx`
  - ✅ `CFDI_PAC_API_KEY=sk_live_xxxxx`
  - ✅ `CFDI_MODO=production`

### 4. CORS

- [ ] **Configurar CORS solo para tus dominios**
  ```bash
  CORS_ORIGINS=https://tu-frontend.vercel.app,https://tu-portal.vercel.app
  ```
  - ❌ NO usar `*` (permitir todos los orígenes)
  - ❌ NO dejar `http://localhost`

### 5. Orden de Despliegue

- [ ] **1. Backend primero** - Necesitas la URL para configurar frontends
- [ ] **2. Frontend** - Configurar `VITE_BACKEND_URL`
- [ ] **3. Portal** - Configurar `VITE_API_URL`
- [ ] **4. Actualizar CORS** - Con las URLs reales del frontend y portal

### 6. Variables en Vercel Dashboard

Para CADA proyecto en Vercel (backend, frontend, portal):

1. Ve a: Project → Settings → Environment Variables
2. Agrega las variables de `.env.production.example`
3. Selecciona "Production" como ambiente

**Backend:**
```
DATABASE_URL
JWT_SECRET
CORS_ORIGINS
CFDI_PAC_API_KEY
CFDI_PAC_SECRET
CFDI_MODO
COMPANY_RFC
COMPANY_RAZON_SOCIAL
COMPANY_REGIMEN_FISCAL
COMPANY_CP
```

**Frontend:**
```
VITE_BACKEND_URL
```

**Portal:**
```
VITE_API_URL
```

### 7. Verificación Post-Despliegue

- [ ] **Backend health check funciona**
  ```bash
  curl https://tu-backend.vercel.app/health
  # Debe retornar: {"ok":true,"env":"production"}
  ```

- [ ] **Frontend puede conectarse al backend**
  - Abre DevTools → Network
  - Verifica que las peticiones vayan a tu backend de Vercel
  - NO deben ir a localhost

- [ ] **Portal puede conectarse al backend**
  - Igual que frontend

- [ ] **No hay errores de CORS en la consola**

### 8. Archivos Sensibles

- [ ] **Revisar que estos archivos NO estén en Git:**
  ```bash
  git ls-files | grep -E "\.env$|\.env\.local|\.env\.production"
  # No debe retornar NADA
  ```

- [ ] **Revisar historial de commits**
  ```bash
  git log --all --full-history -- "**/.env"
  # Si hay commits, necesitas limpiar el historial
  ```

### 9. Seguridad Adicional

- [ ] **Headers de seguridad configurados** (ya están en `vercel.json`)
  - X-Content-Type-Options
  - X-Frame-Options
  - X-XSS-Protection

- [ ] **Rate limiting habilitado** (ya está en el backend)

- [ ] **Helmet.js configurado** (ya está en el backend)

### 10. Cleanup

- [ ] **Eliminar archivos innecesarios**
  ```bash
  # Eliminar node_modules si vas a hacer commit
  rm -rf */node_modules
  ```

- [ ] **Eliminar carpetas de build local**
  ```bash
  rm -rf */dist */build
  ```

---

## 🚨 SI SUBISTE UN SECRETO A GIT POR ERROR

### 1. **ROTAR INMEDIATAMENTE** las credenciales comprometidas
   - Cambia JWT_SECRET
   - Regenera API keys de FacturAPI
   - Cambia contraseñas de base de datos

### 2. **Eliminar del historial de Git**
   ```bash
   # Usar BFG Repo-Cleaner o git filter-branch
   # Contacta a tu equipo de DevOps si no estás seguro
   ```

### 3. **Force push** (solo si es un repo privado y coordinado con el equipo)

---

## ✅ Lista Final

Antes de ejecutar `vercel --prod`:

- [ ] Leí toda esta checklist
- [ ] Verifiqué que no hay secretos en Git
- [ ] Configuré todas las variables de entorno en Vercel
- [ ] Tengo una base de datos de producción lista
- [ ] Cambié todas las credenciales de test a producción
- [ ] Entiendo el orden de despliegue (backend → frontend → portal)

---

## 📞 Recursos

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

¡Listo para desplegar de forma segura! 🚀🔒
