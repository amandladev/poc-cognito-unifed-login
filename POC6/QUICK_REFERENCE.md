# 🚀 Comandos Rápidos - POC6

Referencia rápida de comandos para trabajar con el proyecto.

---

## 📦 Instalación

### Instalar todo de una vez
```bash
cd POC6
./install.sh
```

### Instalar manualmente

**Backend:**
```bash
cd POC6/backend
npm install
```

**Frontend:**
```bash
cd POC6/frontend
npm install
```

---

## 🏃 Desarrollo

### Iniciar Backend (Terminal 1)
```bash
cd POC6/backend
npm run dev
```

### Iniciar Frontend (Terminal 2)
```bash
cd POC6/frontend
npm run dev
```

### Verificar que todo funciona
```bash
# Health check del backend
curl http://localhost:3001/health

# Abrir frontend
open http://localhost:3000
```

---

## 🔨 Build

### Build Backend
```bash
cd POC6/backend
npm run build
npm start
```

### Build Frontend
```bash
cd POC6/frontend
npm run build
npm run preview
```

---

## 🧪 Testing

### Test del Backend

**Health Check:**
```bash
curl http://localhost:3001/health
```

**Token Exchange (necesitas un token real):**
```bash
curl -X POST http://localhost:3001/auth/exchange-token \
  -H "Content-Type: application/json" \
  -d '{"cognitoToken":"YOUR_COGNITO_ID_TOKEN_HERE"}'
```

**Get User Info:**
```bash
curl http://localhost:3001/auth/user/YOUR_USER_ID
```

---

## 🔐 AWS CLI - Verificar Credenciales

### Configurar credenciales temporales
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_SESSION_TOKEN=your_session_token
```

### Verificar identidad
```bash
aws sts get-caller-identity
```

### Ver rol asignado
```bash
aws sts get-caller-identity | jq -r '.Arn'
```

---

## 🐛 Debugging

### Ver logs del backend
El backend imprime logs detallados en la terminal donde se ejecuta `npm run dev`

### Ver logs del frontend
Abre DevTools (F12) en el navegador y ve a la pestaña Console

### Verificar variables de entorno

**Backend:**
```bash
cd POC6/backend
cat .env
```

**Frontend:**
```bash
cd POC6/frontend
cat .env
```

### Limpiar y reinstalar

**Backend:**
```bash
cd POC6/backend
rm -rf node_modules package-lock.json
npm install
```

**Frontend:**
```bash
cd POC6/frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🔄 Git

### Inicializar repositorio
```bash
cd POC6
git init
git add .
git commit -m "Initial commit - POC6 Cognito + Firebase"
```

### Verificar que archivos sensibles están ignorados
```bash
git status
# NO deberías ver:
# - firebase-service-account.json
# - .env files
# - node_modules/
```

---

## 📊 Monitoreo

### Ver procesos corriendo
```bash
# Ver todos los procesos de Node
ps aux | grep node

# Ver qué está usando el puerto 3000
lsof -i :3000

# Ver qué está usando el puerto 3001
lsof -i :3001
```

### Matar procesos si es necesario
```bash
# Matar proceso en puerto 3000
kill -9 $(lsof -t -i:3000)

# Matar proceso en puerto 3001
kill -9 $(lsof -t -i:3001)
```

---

## 🔧 Mantenimiento

### Actualizar dependencias

**Backend:**
```bash
cd POC6/backend
npm update
```

**Frontend:**
```bash
cd POC6/frontend
npm update
```

### Ver dependencias desactualizadas
```bash
npm outdated
```

### Auditar seguridad
```bash
npm audit
npm audit fix
```

---

## 📝 Type Checking

### Backend
```bash
cd POC6/backend
npm run type-check
```

### Frontend
```bash
cd POC6/frontend
npm run type-check
```

---

## 🌐 URLs Importantes

### Desarrollo
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Backend Health**: http://localhost:3001/health

### AWS Cognito Console
```
https://console.aws.amazon.com/cognito/
```

### Firebase Console
```
https://console.firebase.google.com/
```

---

## 🔑 Obtener Token de Cognito (para testing)

1. Inicia sesión en la aplicación
2. Abre DevTools (F12)
3. En la consola, ejecuta:
```javascript
import { fetchAuthSession } from 'aws-amplify/auth';
const session = await fetchAuthSession();
console.log('ID Token:', session.tokens.idToken.toString());
```

O simplemente busca en los logs del frontend el token que se imprime automáticamente.

---

## 📦 Estructura de Archivos Clave

```
POC6/
├── backend/
│   ├── .env                              # ⚠️ Configura esto
│   ├── firebase-service-account.json    # ⚠️ Descarga desde Firebase
│   ├── src/server.ts                    # Entry point
│   └── src/services/                    # Lógica de negocio
│
├── frontend/
│   ├── .env                             # ⚠️ Configura esto
│   ├── src/main.tsx                     # Entry point
│   ├── src/auth/UnifiedAuthContext.tsx  # Lógica de autenticación
│   └── src/ui/App.tsx                   # UI principal
│
├── README.md                            # Información general
├── SETUP_GUIDE.md                       # Guía paso a paso
├── EXECUTIVE_SUMMARY.md                 # Resumen ejecutivo
└── QUICK_REFERENCE.md                   # Este archivo
```

---

## 💡 Tips

1. **Siempre inicia el backend primero**, luego el frontend
2. **Verifica el health check** antes de intentar login
3. **Revisa los logs** cuando algo no funcione
4. **Las credenciales nunca deben committearse** a Git
5. **Los custom tokens de Firebase expiran en 1 hora**

---

## 🆘 Comandos de Emergencia

### Todo dejó de funcionar
```bash
# 1. Mata todos los procesos
kill -9 $(lsof -t -i:3000)
kill -9 $(lsof -t -i:3001)

# 2. Limpia y reinstala
cd POC6/backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install

# 3. Reinicia todo
cd ../backend
npm run dev
# Nueva terminal
cd ../frontend
npm run dev
```

### Backend no conecta a Firebase
```bash
# Verifica que el archivo existe
ls -la POC6/backend/firebase-service-account.json

# Verifica que la ruta en .env es correcta
cat POC6/backend/.env | grep FIREBASE_SERVICE_ACCOUNT_PATH
```

### Frontend no puede hacer login
```bash
# Verifica URLs de callback en Cognito Console
# Deben incluir: http://localhost:3000/

# Verifica variables de entorno
cat POC6/frontend/.env | grep COGNITO
```

---

**Última actualización**: Octubre 2025
