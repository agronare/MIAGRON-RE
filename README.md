# 🌾 MIAGRON-RE

Sistema ERP integral para AGRONARE - Gestión empresarial completa (ERP, CRM, RH, Logística, RPA y Finanzas)

## 📦 Estructura del Proyecto

```
MIAGRON-RE/
├── backend/          # API REST (Express + Prisma + PostgreSQL)
├── frontend/         # Dashboard Principal (React + Vite + TypeScript)
├── portal/           # Portal de Facturación (React + Vite + TypeScript)
└── DESPLIEGUE_VERCEL.md  # Guía completa de despliegue
```

## 🚀 Despliegue en Vercel

### Despliegue Rápido

```bash
# Desplegar todo
./deploy.sh all

# O despliega componentes individuales
./deploy.sh backend
./deploy.sh frontend
./deploy.sh portal
```

### Configuración Manual

Lee la guía completa en [DESPLIEGUE_VERCEL.md](./DESPLIEGUE_VERCEL.md)

## 🔐 Seguridad

- ✅ Archivos `.env` protegidos por `.gitignore`
- ✅ Variables de entorno separadas por ambiente
- ✅ Headers de seguridad configurados
- ✅ CORS configurado correctamente
- ✅ Rate limiting habilitado
- ✅ Helmet.js para protección adicional

## 🛠️ Desarrollo Local

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Portal
```bash
cd portal
npm install
npm run dev
```

## 📚 Documentación

- [Guía de Despliegue en Vercel](./DESPLIEGUE_VERCEL.md)
- [Guía de Pruebas](./GUIA_PRUEBAS.md)

## 🤝 Contribuir

1. Crea una rama para tu feature
2. Realiza tus cambios
3. Asegúrate de no subir archivos `.env`
4. Crea un Pull Request

## 📄 Licencia

MIT