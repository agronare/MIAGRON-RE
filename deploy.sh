#!/bin/bash

# 🚀 Script de Despliegue MIAGRON-RE en Vercel
# Uso: ./deploy.sh [backend|frontend|portal|all]

set -e

COLOR_GREEN='\033[0;32m'
COLOR_BLUE='\033[0;34m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_BLUE}🌾 MIAGRON-RE - Despliegue en Vercel${COLOR_RESET}"
echo ""

# Verificar que Vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${COLOR_RED}❌ Error: Vercel CLI no está instalado${COLOR_RESET}"
    echo "Instálalo con: npm install -g vercel"
    exit 1
fi

# Función para desplegar el backend
deploy_backend() {
    echo -e "${COLOR_BLUE}📦 Desplegando Backend...${COLOR_RESET}"
    cd backend

    echo "  → Instalando dependencias..."
    npm install

    echo "  → Compilando TypeScript..."
    npm run build

    echo "  → Desplegando a Vercel..."
    vercel --prod

    cd ..
    echo -e "${COLOR_GREEN}✅ Backend desplegado${COLOR_RESET}"
    echo ""
}

# Función para desplegar el frontend
deploy_frontend() {
    echo -e "${COLOR_BLUE}📦 Desplegando Frontend (Dashboard)...${COLOR_RESET}"
    cd frontend

    echo "  → Instalando dependencias..."
    npm install

    echo "  → Desplegando a Vercel..."
    vercel --prod

    cd ..
    echo -e "${COLOR_GREEN}✅ Frontend desplegado${COLOR_RESET}"
    echo ""
}

# Función para desplegar el portal
deploy_portal() {
    echo -e "${COLOR_BLUE}📦 Desplegando Portal (Facturación)...${COLOR_RESET}"
    cd portal

    echo "  → Instalando dependencias..."
    npm install

    echo "  → Desplegando a Vercel..."
    vercel --prod

    cd ..
    echo -e "${COLOR_GREEN}✅ Portal desplegado${COLOR_RESET}"
    echo ""
}

# Verificar argumentos
if [ $# -eq 0 ]; then
    echo -e "${COLOR_YELLOW}Uso: ./deploy.sh [backend|frontend|portal|all]${COLOR_RESET}"
    echo ""
    echo "Opciones:"
    echo "  backend   - Despliega solo el backend"
    echo "  frontend  - Despliega solo el frontend"
    echo "  portal    - Despliega solo el portal"
    echo "  all       - Despliega todo (backend → frontend → portal)"
    exit 1
fi

case "$1" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    portal)
        deploy_portal
        ;;
    all)
        echo -e "${COLOR_YELLOW}⚠️  Desplegando todas las aplicaciones...${COLOR_RESET}"
        echo -e "${COLOR_YELLOW}   Asegúrate de haber configurado las variables de entorno en Vercel Dashboard${COLOR_RESET}"
        echo ""
        deploy_backend
        deploy_frontend
        deploy_portal
        echo -e "${COLOR_GREEN}🎉 Todas las aplicaciones han sido desplegadas${COLOR_RESET}"
        ;;
    *)
        echo -e "${COLOR_RED}❌ Error: Opción inválida '$1'${COLOR_RESET}"
        echo "Opciones válidas: backend, frontend, portal, all"
        exit 1
        ;;
esac

echo -e "${COLOR_GREEN}✨ Despliegue completado${COLOR_RESET}"
echo ""
echo -e "${COLOR_BLUE}📝 Próximos pasos:${COLOR_RESET}"
echo "  1. Verifica las URLs de tus aplicaciones en Vercel Dashboard"
echo "  2. Configura las variables de entorno si no lo has hecho"
echo "  3. Actualiza CORS_ORIGINS en el backend con las URLs reales"
echo "  4. Ejecuta las migraciones de base de datos en producción"
echo ""
echo "📚 Más información: Lee DESPLIEGUE_VERCEL.md"
