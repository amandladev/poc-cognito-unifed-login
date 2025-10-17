#!/bin/bash

# Script de instalación rápida para POC6
# Este script instala todas las dependencias del proyecto

echo "=================================="
echo "🚀 POC6 - Instalación Rápida"
echo "=================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Este script debe ejecutarse desde el directorio POC6${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Instalando dependencias del backend...${NC}"
cd backend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error instalando dependencias del backend${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

echo -e "${BLUE}📦 Instalando dependencias del frontend...${NC}"
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error instalando dependencias del frontend${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Crear archivos .env si no existen
cd ../backend
if [ ! -f ".env" ]; then
    echo -e "${BLUE}📝 Creando backend/.env desde .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Archivo creado. Por favor edita backend/.env con tus credenciales.${NC}"
else
    echo -e "${GREEN}✅ backend/.env ya existe${NC}"
fi
echo ""

cd ../frontend
if [ ! -f ".env" ]; then
    echo -e "${BLUE}📝 Creando frontend/.env desde .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Archivo creado. Por favor edita frontend/.env con tus credenciales.${NC}"
else
    echo -e "${GREEN}✅ frontend/.env ya existe${NC}"
fi
echo ""

cd ..

echo "=================================="
echo -e "${GREEN}✅ Instalación completada!${NC}"
echo "=================================="
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Configura las variables de entorno:"
echo "   - Edita backend/.env con tus credenciales de AWS Cognito y Firebase"
echo "   - Edita frontend/.env con tus credenciales"
echo ""
echo "2. Descarga el archivo de credenciales de Firebase Admin SDK"
echo "   y guárdalo como backend/firebase-service-account.json"
echo ""
echo "3. Inicia el backend:"
echo "   cd backend && npm run dev"
echo ""
echo "4. En otra terminal, inicia el frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "📖 Para más información, consulta:"
echo "   - README.md (información general)"
echo "   - SETUP_GUIDE.md (guía detallada de configuración)"
echo ""
