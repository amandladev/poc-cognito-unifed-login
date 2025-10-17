# 📋 Guía de Configuración Completa - POC6

Esta guía te llevará paso a paso para configurar completamente el proyecto.

## 📑 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de AWS Cognito](#configuración-de-aws-cognito)
3. [Configuración de Firebase](#configuración-de-firebase)
4. [Configuración del Backend](#configuración-del-backend)
5. [Configuración del Frontend](#configuración-del-frontend)
6. [Ejecutar el Proyecto](#ejecutar-el-proyecto)
7. [Verificación](#verificación)

---

## 1. Requisitos Previos

- ✅ Node.js 18+ instalado
- ✅ npm o pnpm instalado
- ✅ Cuenta de AWS con acceso a Cognito
- ✅ Proyecto de Firebase activo
- ✅ AWS CLI instalado (opcional, para testing)

---

## 2. Configuración de AWS Cognito

### Paso 1: Crear o Usar un User Pool Existente

1. Ve a [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Si no tienes un User Pool, créalo con las siguientes configuraciones:
   - **Authentication providers**: Cognito User Pool
   - **MFA**: Opcional (puedes desactivarlo para testing)
   - **Password policy**: Por defecto está bien

### Paso 2: Crear un App Client

1. En tu User Pool, ve a **App integration** → **App clients**
2. Click en **Create app client**
3. Configuración:
   - **App type**: Public client
   - **App client name**: `poc6-client`
   - **Authentication flows**: Marca "ALLOW_USER_PASSWORD_AUTH" y "ALLOW_REFRESH_TOKEN_AUTH"
   - **OAuth 2.0 grant types**: Marca "Authorization code grant"
   - **OpenID Connect scopes**: Marca `openid`, `email`, `profile`, `phone`

4. **Callback URLs**: Agrega las siguientes URLs:
   ```
   http://localhost:3000/
   http://localhost:5173/
   ```

5. **Sign-out URLs**: Agrega las mismas URLs:
   ```
   http://localhost:3000/
   http://localhost:5173/
   ```

6. Guarda y **copia el Client ID** (lo necesitarás después)

### Paso 3: Configurar Hosted UI Domain

1. En tu User Pool, ve a **App integration** → **Domain**
2. Si no tienes un dominio, créalo:
   - **Domain type**: Cognito domain
   - **Cognito domain**: Elige un nombre único (ej: `poc6-tuempresa`)
3. Guarda el dominio completo (ej: `poc6-tuempresa.auth.us-east-1.amazoncognito.com`)

### Paso 4: Crear un Usuario de Prueba

1. Ve a **Users** en tu User Pool
2. Click en **Create user**
3. Completa:
   - **Email**: tu-email@example.com
   - **Password**: Una contraseña temporal (ej: `TempPass123!`)
   - Marca "Send an email invitation" si quieres
4. Crea el usuario

### 📝 Anota estos valores:

```
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_DOMAIN=poc6-tuempresa.auth.us-east-1.amazoncognito.com
```

---

## 3. Configuración de Firebase

### Paso 1: Crear o Usar un Proyecto de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente

### Paso 2: Habilitar Firebase Authentication

1. En tu proyecto, ve a **Authentication**
2. Click en **Get started**
3. En la pestaña **Sign-in method**, habilita al menos un proveedor (puede ser Email/Password)
   - Esto es necesario aunque no lo uses directamente

### Paso 3: Crear una App Web

1. En **Project Settings**, ve a **Your apps**
2. Click en el ícono de **Web** (</>) para agregar una app web
3. **App nickname**: `poc6-frontend`
4. **No** marques "Also set up Firebase Hosting"
5. Click en **Register app**
6. **Copia toda la configuración** de Firebase que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxxxxxxxxx"
};
```

### Paso 4: Generar Service Account Key

1. En **Project Settings**, ve a **Service accounts**
2. Click en **Generate new private key**
3. Click en **Generate key** en el modal de confirmación
4. Se descargará un archivo JSON con un nombre similar a `tu-proyecto-firebase-adminsdk-xxxxx.json`
5. **Guarda este archivo de forma segura** (lo necesitarás para el backend)

### 📝 Anota estos valores:

```
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxxxxxxxx
```

---

## 4. Configuración del Backend

### Paso 1: Instalar Dependencias

```bash
cd POC6/backend
npm install
```

### Paso 2: Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `backend/.env` con tus valores:

```bash
# AWS Cognito
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Firebase
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Server
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Paso 3: Agregar Firebase Service Account

1. Copia el archivo JSON que descargaste de Firebase
2. Renómbralo a `firebase-service-account.json`
3. Colócalo en el directorio `backend/`

```bash
# Debe quedar así:
# backend/
#   firebase-service-account.json
#   .env
#   package.json
#   ...
```

### Paso 4: Verificar Configuración

```bash
npm run dev
```

Deberías ver:

```
✅ CognitoService initialized for pool: us-east-1_XXXXXXX
✅ Firebase initialized for project: tu-proyecto
═══════════════════════════════════════════════════════════════
🚀 Cognito-Firebase Bridge Server
═══════════════════════════════════════════════════════════════
📍 Server running on port: 3001
```

Si hay errores, revisa que:
- El archivo `firebase-service-account.json` exista
- Todas las variables de entorno estén configuradas
- No haya errores de tipeo en los IDs

---

## 5. Configuración del Frontend

### Paso 1: Instalar Dependencias

```bash
cd POC6/frontend
npm install
```

### Paso 2: Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `frontend/.env` con tus valores:

```bash
# Cognito
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXX
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_DOMAIN=poc6-tuempresa.auth.us-east-1.amazoncognito.com
VITE_COGNITO_REDIRECT_SIGNIN=http://localhost:3000/
VITE_COGNITO_REDIRECT_SIGNOUT=http://localhost:3000/
VITE_COGNITO_SCOPES=openid email profile phone

# Firebase
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxxxxxxxx

# Backend
VITE_BACKEND_URL=http://localhost:3001
```

---

## 6. Ejecutar el Proyecto

### Terminal 1: Backend

```bash
cd POC6/backend
npm run dev
```

Espera a ver el mensaje:
```
✅ Ready to accept requests
```

### Terminal 2: Frontend

```bash
cd POC6/frontend
npm run dev
```

Deberías ver:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## 7. Verificación

### Paso 1: Verificar Backend

Abre http://localhost:3001/health en tu navegador.

Deberías ver:
```json
{
  "status": "ok",
  "service": "cognito-firebase-bridge",
  "timestamp": "2024-xx-xx...",
  "version": "1.0.0"
}
```

### Paso 2: Probar la Aplicación

1. Abre http://localhost:3000/ en tu navegador
2. Deberías ver la pantalla de login
3. Si ves una advertencia de backend, verifica que el backend esté ejecutándose
4. Click en **"Login with Cognito"**
5. Serás redirigido a la página de login de Cognito
6. Ingresa las credenciales del usuario que creaste
7. Después del login exitoso, serás redirigido de vuelta a la app
8. Deberías ver:
   - ✅ Información del usuario
   - ✅ Estado de Cognito (Authenticated)
   - ✅ Estado de Firebase (Authenticated)

### Paso 3: Verificar en la Consola del Navegador

Abre la consola del navegador (F12) y busca estos logs:

```
✅ Cognito configured
✅ Firebase configured
🔍 Checking for existing Cognito session...
✅ Cognito session found for: username
🔄 Attempting Firebase authentication...
🔄 Exchanging Cognito token for Firebase token...
✅ Token exchange successful
✅ Firebase authentication successful
🔥 Firebase auth state changed: uuid-xxx-xxx
```

---

## 🎉 ¡Listo!

Tu aplicación de login unificado está funcionando correctamente.

### Próximos pasos:

1. **Probar Logout**: Click en "Logout" y verifica que cierre sesión en ambos sistemas
2. **Probar Refresh**: Recarga la página y verifica que la sesión persista
3. **Ver Tokens**: En la UI puedes ver los tokens truncados de Cognito y Firebase
4. **Usar servicios**: Ahora puedes usar tanto servicios de AWS como de Firebase

### 🐛 Si algo no funciona:

1. Revisa los logs del backend (terminal 1)
2. Revisa los logs del frontend (consola del navegador)
3. Verifica que todas las URLs de callback estén correctamente configuradas en Cognito
4. Verifica que todas las variables de entorno sean correctas
5. Consulta la sección de Troubleshooting en los READMEs

### 🔒 Seguridad en Producción:

- [ ] Usar HTTPS para todas las URLs
- [ ] No exponer el archivo `firebase-service-account.json`
- [ ] Usar AWS Secrets Manager o similar para las credenciales
- [ ] Implementar rate limiting en el backend
- [ ] Agregar refresh token logic
- [ ] Implementar logging estructurado
- [ ] Agregar monitoring y alertas
