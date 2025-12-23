#!/bin/bash

# Script para configurar base de datos Neon
# Uso: ./setup-neon.sh "tu-connection-string-aqui"

set -e

COLOR_GREEN='\033[0;32m'
COLOR_BLUE='\033[0;34m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_RESET='\033[0m'

if [ $# -eq 0 ]; then
    echo -e "${COLOR_RED}❌ Error: Falta el connection string${COLOR_RESET}"
    echo ""
    echo "Uso: ./setup-neon.sh \"postgresql://user:pass@host/db\""
    echo ""
    echo "Ejemplo:"
    echo "./setup-neon.sh \"postgresql://agronare_owner:abc123@ep-xxx.aws.neon.tech/agronare?sslmode=require\""
    exit 1
fi

DATABASE_URL="$1"

echo -e "${COLOR_BLUE}🌾 AGRONARE - Configuración de Base de Datos Neon${COLOR_RESET}"
echo ""

# Paso 1: Aplicar migraciones
echo -e "${COLOR_YELLOW}📦 Paso 1/4: Aplicando migraciones de Prisma...${COLOR_RESET}"
cd /workspaces/MIAGRON-RE/backend
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy
echo -e "${COLOR_GREEN}✅ Migraciones aplicadas${COLOR_RESET}"
echo ""

# Paso 2: Generar cliente de Prisma
echo -e "${COLOR_YELLOW}📦 Paso 2/4: Generando cliente de Prisma...${COLOR_RESET}"
DATABASE_URL="$DATABASE_URL" npx prisma generate
echo -e "${COLOR_GREEN}✅ Cliente generado${COLOR_RESET}"
echo ""

# Paso 3: Ejecutar seed (datos iniciales)
echo -e "${COLOR_YELLOW}📦 Paso 3/4: Insertando datos iniciales...${COLOR_RESET}"
DATABASE_URL="$DATABASE_URL" npm run prisma:seed || echo -e "${COLOR_YELLOW}⚠️  Seed opcional - puede fallar si ya hay datos${COLOR_RESET}"
echo -e "${COLOR_GREEN}✅ Datos iniciales procesados${COLOR_RESET}"
echo ""

# Paso 4: Configurar en Vercel
echo -e "${COLOR_YELLOW}📦 Paso 4/4: Configurando DATABASE_URL en Vercel...${COLOR_RESET}"
cd /workspaces/MIAGRON-RE/backend

# Remover variable existente si existe
vercel env rm DATABASE_URL production --yes 2>/dev/null || true

# Agregar nueva variable
echo "y
$DATABASE_URL" | vercel env add DATABASE_URL production

echo -e "${COLOR_GREEN}✅ Variable configurada en Vercel${COLOR_RESET}"
echo ""

# Paso 5: Re-desplegar backend
echo -e "${COLOR_YELLOW}🚀 Desplegando backend con nueva base de datos...${COLOR_RESET}"
vercel --prod --yes

echo ""
echo -e "${COLOR_GREEN}🎉 ¡Configuración completada!${COLOR_RESET}"
echo ""
echo -e "${COLOR_BLUE}📝 Próximos pasos:${COLOR_RESET}"
echo "  1. Verifica que el backend funcione: https://backend-ten-iota-99.vercel.app/health"
echo "  2. Abre el frontend: https://frontend-seven-theta-28.vercel.app"
echo "  3. Abre el portal: https://portal-seven-orpin.vercel.app"
echo ""
echo -e "${COLOR_GREEN}✨ Tu aplicación está lista para usar!${COLOR_RESET}"
