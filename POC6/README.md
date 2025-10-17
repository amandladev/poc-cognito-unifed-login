# POC6: Login Unificado Cognito + Firebase

Este proyecto implementa un flujo de autenticación unificado donde:
1. El usuario se autentica en AWS Cognito
2. El backend valida el token de Cognito
3. El backend genera un Custom Token de Firebase
4. El frontend usa ambos sistemas de autenticación de forma transparente

## 📋 Arquitectura

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│             │         │                  │         │                 │
│   Frontend  │────────▶│  AWS Cognito     │         │   Backend       │
│   (React)   │  Login  │  Hosted UI       │         │   Bridge        │
│             │◀────────│                  │         │   (Express)     │
└─────┬───────┘  Token  └──────────────────┘         └────────┬────────┘
      │                                                         │
      │  1. ID Token                                           │
      │────────────────────────────────────────────────────────▶│
      │                                                         │
      │                                                         │ 2. Valida
      │                                                         │    Token
      │                                                         │
      │                                                    ┌────▼──────┐
      │                                                    │  Cognito  │
      │                                                    │   JWKS    │
      │                                                    └────┬──────┘
      │                                                         │
      │                                                         │ 3. Genera
      │                                                         │    Custom
      │                                                         │    Token
      │                                                         │
      │                                                    ┌────▼──────┐
      │  4. Custom Token                                  │ Firebase  │
      │◀────────────────────────────────────────────────────│  Admin    │
      │                                                    └───────────┘
      │
      │  5. signInWithCustomToken()
      │
 ┌────▼──────────┐
 │   Firebase    │
 │   Auth        │
 └───────────────┘
 
 ✅ Usuario autenticado en Cognito + Firebase
```

## 🚀 Configuración Rápida

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Configura las variables de entorno
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configura las variables de entorno
npm run dev
```

## 📁 Estructura del Proyecto

```
POC6/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── cognitoService.ts    # Validación de tokens de Cognito
│   │   │   └── firebaseService.ts   # Creación de tokens de Firebase
│   │   ├── controllers/
│   │   │   └── authController.ts    # Lógica de intercambio de tokens
│   │   └── server.ts                # Servidor Express
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── auth/
    │   │   ├── UnifiedAuthContext.tsx   # Context con Cognito + Firebase
    │   │   └── bridgeService.ts         # Cliente para backend
    │   ├── config/
    │   │   ├── cognitoConfig.ts         # Configuración de Cognito
    │   │   └── firebaseConfig.ts        # Configuración de Firebase
    │   ├── ui/
    │   │   └── App.tsx                  # UI principal
    │   └── main.tsx
    ├── package.json
    ├── tsconfig.json
    └── .env

```

## 🔧 Configuración de AWS Cognito

### Paso 1: Configurar el User Pool de Cognito

En la consola de AWS Cognito:

1. Ve a tu User Pool
2. En "App integration" → "App client settings"
3. Asegúrate de tener:
   - ✅ Hosted UI habilitado
   - ✅ OAuth 2.0 flows: Authorization code grant
   - ✅ Callback URLs configuradas
   - ✅ Scopes: openid, email, profile

### Paso 2: Obtener credenciales

Necesitas:
- `COGNITO_USER_POOL_ID`: us-east-1_XXXXXXX
- `COGNITO_CLIENT_ID`: ID del app client
- `COGNITO_DOMAIN`: tu-dominio.auth.region.amazoncognito.com
- `AWS_REGION`: us-east-1 (o tu región)

## 🔥 Configuración de Firebase

### Paso 1: Crear proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Ve a "Project Settings" → "Service Accounts"
4. Click en "Generate new private key"
5. Guarda el archivo JSON como `firebase-service-account.json` en el directorio `backend/`

### Paso 2: Configurar Firebase en la Web

1. En Firebase Console, ve a "Project Settings"
2. En "Your apps", agrega una aplicación web
3. Copia la configuración (apiKey, authDomain, etc.)

### Paso 3: Habilitar Custom Token

1. En Firebase Console, ve a "Authentication"
2. En la pestaña "Sign-in method"
3. Asegúrate de tener habilitado al menos un proveedor

## 🔑 Variables de Entorno

### Backend (.env)

```bash
# AWS Cognito
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXX
COGNITO_CLIENT_ID=your_client_id

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Server
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (.env)

```bash
# Cognito
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXX
VITE_COGNITO_CLIENT_ID=your_client_id
VITE_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
VITE_COGNITO_REDIRECT_SIGNIN=http://localhost:3000/
VITE_COGNITO_REDIRECT_SIGNOUT=http://localhost:3000/

# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Backend API
VITE_BACKEND_URL=http://localhost:3001
```

## 📖 Cómo Funciona

### Flujo de Autenticación

1. **Login en Cognito**
   ```typescript
   await login(); // Redirige a Cognito Hosted UI
   ```

2. **Callback y Token de Cognito**
   - Usuario completa login en Cognito
   - Cognito redirige de vuelta con authorization code
   - Amplify intercambia el code por tokens (idToken, accessToken)

3. **Intercambio de Token (Backend)**
   ```typescript
   POST /auth/exchange-token
   Body: { cognitoToken: "eyJhbGc..." }
   
   Response: {
     firebaseToken: "eyJhbGc...",
     user: { id, email, username }
   }
   ```

4. **Autenticación en Firebase**
   ```typescript
   await signInWithCustomToken(auth, firebaseToken);
   ```

5. **Usuario Autenticado**
   - ✅ Autenticado en Cognito
   - ✅ Autenticado en Firebase
   - ✅ Puede usar servicios de ambos

## 🧪 Probando la POC

### 1. Iniciar Backend
```bash
cd backend
npm run dev
```

Deberías ver:
```
🚀 Server running on port 3001
📍 Health check: http://localhost:3001/health
🔐 Token exchange: http://localhost:3001/auth/exchange-token
```

### 2. Iniciar Frontend
```bash
cd frontend
npm run dev
```

### 3. Flujo de Prueba

1. Abre http://localhost:3000
2. Click en "Login with Cognito"
3. Completa login en Cognito
4. Observa la consola del navegador:
   - ✅ Token de Cognito recibido
   - ✅ Token intercambiado con backend
   - ✅ Firebase custom token recibido
   - ✅ Usuario autenticado en Firebase

### 4. Verificar Datos

En la UI verás:
- Email del usuario
- ID del usuario
- Estado de ambas sesiones (Cognito + Firebase)
- Tokens (parcialmente ocultos por seguridad)

## 🔒 Seguridad

### ✅ Buenas Prácticas Implementadas

1. **Validación de Tokens**: El backend valida completamente el token de Cognito usando JWKS
2. **No exponer secretos**: Las claves de Firebase nunca llegan al frontend
3. **CORS configurado**: Solo orígenes permitidos pueden acceder al backend
4. **Tokens de corta duración**: Los custom tokens de Firebase expiran
5. **HTTPS en producción**: Usa HTTPS para todos los endpoints

### ⚠️ Consideraciones

- Los custom tokens de Firebase expiran en 1 hora
- Implementa refresh token logic para sesiones largas
- En producción, usa variables de entorno seguras (AWS Secrets Manager, etc.)
- Implementa rate limiting en el backend

## 🐛 Troubleshooting

### Error: "Token validation failed"
- Verifica que el `COGNITO_CLIENT_ID` en el backend coincida con el del frontend
- Verifica que la región sea correcta
- Asegúrate de estar enviando el `idToken`, no el `accessToken`

### Error: "Firebase service account not found"
- Verifica que `firebase-service-account.json` exista en el directorio backend
- Verifica que la ruta en `.env` sea correcta
- Verifica que el archivo JSON sea válido

### Error: "CORS policy"
- Verifica que `ALLOWED_ORIGINS` incluya la URL del frontend
- En desarrollo: usa `http://localhost:3000` o `http://localhost:5173`

### Error: "User not found in Firebase"
- Esto es normal, el backend crea el usuario automáticamente
- Verifica los logs del backend para ver si se creó correctamente

## 📚 Recursos Adicionales

- [AWS Amplify Auth](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)
- [Firebase Custom Tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens)
- [Cognito JWT Verification](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html)

## 🎯 Próximos Pasos

- [ ] Implementar refresh de tokens
- [ ] Agregar manejo de errores más robusto
- [ ] Implementar logout unificado
- [ ] Agregar tests unitarios
- [ ] Implementar rate limiting
- [ ] Agregar logging estructurado
