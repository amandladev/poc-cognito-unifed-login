# Frontend - POC6 Cognito + Firebase

Frontend de React que implementa autenticación unificada con AWS Cognito y Firebase.

## 🚀 Instalación

```bash
npm install
```

## ⚙️ Configuración

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Edita `.env` con tus credenciales:

### AWS Cognito
- `VITE_COGNITO_USER_POOL_ID`: ID del User Pool de Cognito
- `VITE_COGNITO_CLIENT_ID`: ID del App Client
- `VITE_COGNITO_DOMAIN`: Dominio del Hosted UI
- `VITE_COGNITO_REDIRECT_SIGNIN`: URL de callback después del login
- `VITE_COGNITO_REDIRECT_SIGNOUT`: URL de callback después del logout

### Firebase
- `VITE_FIREBASE_API_KEY`: API Key de Firebase
- `VITE_FIREBASE_AUTH_DOMAIN`: Auth domain de Firebase
- `VITE_FIREBASE_PROJECT_ID`: Project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Messaging sender ID
- `VITE_FIREBASE_APP_ID`: App ID

### Backend
- `VITE_BACKEND_URL`: URL del backend bridge (default: http://localhost:3001)

## 🏃 Ejecutar

```bash
npm run dev
```

La aplicación estará disponible en http://localhost:3000

## 📦 Build para producción

```bash
npm run build
npm run preview
```

## 🔍 Estructura

```
src/
├── auth/
│   ├── UnifiedAuthContext.tsx   # Context con lógica de autenticación
│   └── bridgeService.ts         # Cliente para comunicarse con backend
├── config/
│   ├── cognitoConfig.ts         # Configuración de Amplify/Cognito
│   └── firebaseConfig.ts        # Configuración de Firebase
├── ui/
│   └── App.tsx                  # Componente principal
├── main.tsx                     # Entry point
└── vite-env.d.ts               # Tipos de TypeScript
```

## 🎯 Flujo de Autenticación

1. Usuario click en "Login with Cognito"
2. Redirección a Cognito Hosted UI
3. Usuario completa autenticación
4. Callback a la app con authorization code
5. Amplify intercambia code por tokens
6. App envía idToken al backend
7. Backend valida token y genera custom token de Firebase
8. App autentica en Firebase con custom token
9. Usuario autenticado en ambos sistemas ✅

## 🐛 Debugging

Para ver logs detallados, abre la consola del navegador (F12).

Busca estos mensajes:
- ✅ Cognito configured
- ✅ Firebase configured
- 🔍 Checking for existing Cognito session...
- 🔄 Exchanging Cognito token for Firebase token...
- ✅ Firebase authentication successful
