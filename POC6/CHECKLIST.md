# ✅ Checklist de Configuración - POC6

Usa este checklist para asegurarte de que todo está configurado correctamente.

---

## 📋 Pre-requisitos

- [ ] Node.js 18+ instalado
- [ ] npm o pnpm instalado
- [ ] Cuenta de AWS con acceso a Cognito
- [ ] Proyecto de Firebase creado
- [ ] Git instalado (opcional)

---

## 🔧 Configuración de AWS Cognito

### User Pool

- [ ] User Pool creado en AWS Cognito
- [ ] Anotado el User Pool ID (formato: `us-east-1_XXXXXXX`)
- [ ] Anotado la región (ej: `us-east-1`)

### App Client

- [ ] App Client creado (tipo: Public client)
- [ ] Anotado el Client ID
- [ ] OAuth 2.0 flows configurados:
  - [ ] Authorization code grant habilitado
- [ ] OpenID Connect scopes configurados:
  - [ ] `openid`
  - [ ] `email`
  - [ ] `profile`
  - [ ] `phone` (opcional)
- [ ] Callback URLs agregadas:
  - [ ] `http://localhost:3000/`
  - [ ] `http://localhost:5173/` (si usas este puerto)
- [ ] Sign-out URLs agregadas:
  - [ ] `http://localhost:3000/`
  - [ ] `http://localhost:5173/` (si usas este puerto)

### Hosted UI Domain

- [ ] Dominio del Hosted UI configurado
- [ ] Anotado el dominio completo (ej: `poc6-tuempresa.auth.us-east-1.amazoncognito.com`)

### Usuario de Prueba

- [ ] Usuario de prueba creado
- [ ] Email confirmado (si es necesario)
- [ ] Contraseña conocida

---

## 🔥 Configuración de Firebase

### Proyecto

- [ ] Proyecto de Firebase creado
- [ ] Anotado el Project ID

### Authentication

- [ ] Firebase Authentication habilitado
- [ ] Al menos un proveedor de autenticación habilitado (puede ser Email/Password)

### App Web

- [ ] App web creada en Firebase
- [ ] Anotados todos los valores de configuración:
  - [ ] `apiKey`
  - [ ] `authDomain`
  - [ ] `projectId`
  - [ ] `storageBucket`
  - [ ] `messagingSenderId`
  - [ ] `appId`

### Service Account

- [ ] Private key generada desde Firebase Console
- [ ] Archivo JSON descargado
- [ ] Archivo renombrado a `firebase-service-account.json`
- [ ] Archivo colocado en `POC6/backend/`
- [ ] ⚠️ Archivo agregado a `.gitignore` (no commitear)

---

## 💻 Instalación del Proyecto

### Backend

- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` creado desde `.env.example`
- [ ] Variables de entorno configuradas en `backend/.env`:
  - [ ] `AWS_REGION`
  - [ ] `COGNITO_USER_POOL_ID`
  - [ ] `COGNITO_CLIENT_ID`
  - [ ] `FIREBASE_PROJECT_ID`
  - [ ] `FIREBASE_SERVICE_ACCOUNT_PATH`
  - [ ] `PORT` (default: 3001)
  - [ ] `ALLOWED_ORIGINS`
- [ ] `firebase-service-account.json` existe en backend/

### Frontend

- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` creado desde `.env.example`
- [ ] Variables de entorno configuradas en `frontend/.env`:
  - [ ] `VITE_COGNITO_USER_POOL_ID`
  - [ ] `VITE_COGNITO_CLIENT_ID`
  - [ ] `VITE_COGNITO_DOMAIN`
  - [ ] `VITE_COGNITO_REDIRECT_SIGNIN`
  - [ ] `VITE_COGNITO_REDIRECT_SIGNOUT`
  - [ ] `VITE_COGNITO_SCOPES`
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
  - [ ] `VITE_BACKEND_URL`

---

## 🚀 Verificación de Funcionamiento

### Backend

- [ ] Backend inicia sin errores (`npm run dev`)
- [ ] Se muestra mensaje:
  ```
  ✅ CognitoService initialized for pool: ...
  ✅ Firebase initialized for project: ...
  🚀 Cognito-Firebase Bridge Server
  ✅ Ready to accept requests
  ```
- [ ] Health check funciona: `curl http://localhost:3001/health`
- [ ] Responde con `{"status":"ok",...}`

### Frontend

- [ ] Frontend inicia sin errores (`npm run dev`)
- [ ] Se muestra URL: `http://localhost:3000/`
- [ ] Al abrir en navegador, se ve la UI de login
- [ ] No hay errores en la consola del navegador (F12)
- [ ] Se muestran mensajes:
  ```
  ✅ Cognito configured
  ✅ Firebase configured
  ```

### Integración

- [ ] Al hacer click en "Login with Cognito":
  - [ ] Redirige a página de Cognito
  - [ ] URL contiene el dominio de Cognito configurado
- [ ] Al ingresar credenciales:
  - [ ] Login es exitoso
  - [ ] Redirige de vuelta a la app
- [ ] Después del login:
  - [ ] Se muestra información del usuario
  - [ ] Estado de Cognito: ✅ Authenticated
  - [ ] Estado de Firebase: ✅ Authenticated
  - [ ] No hay errores en consola

---

## 🔍 Checklist de Logs

### Backend (Terminal)

Deberías ver estos logs en orden:

- [ ] `✅ CognitoService initialized for pool: ...`
- [ ] `✅ Firebase initialized for project: ...`
- [ ] `✅ All services initialized successfully`
- [ ] `🚀 Cognito-Firebase Bridge Server`
- [ ] `✅ Ready to accept requests`

Después del login:

- [ ] `📥 POST /auth/exchange-token`
- [ ] `🔄 Starting token exchange...`
- [ ] `1️⃣ Validating Cognito token...`
- [ ] `✅ Token validated for user: ...`
- [ ] `2️⃣ Creating Firebase custom token...`
- [ ] `🎫 Custom token created for user: ...`
- [ ] `3️⃣ Updating Firebase user info...`
- [ ] `✅ Updated Firebase user: ...`
- [ ] `✅ Token exchange completed successfully`

### Frontend (Browser Console)

Deberías ver estos logs en orden:

- [ ] `✅ Cognito configured`
- [ ] `✅ Firebase configured`
- [ ] `🔍 Checking for existing Cognito session...`

Después del login:

- [ ] `✅ Cognito session found for: ...`
- [ ] `🔄 Attempting Firebase authentication...`
- [ ] `🔄 Exchanging Cognito token for Firebase token...`
- [ ] `✅ Token exchange successful`
- [ ] `✅ Firebase authentication successful`
- [ ] `🔥 Firebase auth state changed: ...`

---

## 🐛 Troubleshooting

Si algo no funciona, verifica estos puntos comunes:

### Backend no inicia

- [ ] Todas las variables de entorno están configuradas
- [ ] `firebase-service-account.json` existe y es válido
- [ ] Puerto 3001 no está ocupado por otro proceso
- [ ] Dependencias instaladas correctamente

### Frontend no inicia

- [ ] Todas las variables de entorno están configuradas
- [ ] Puerto 3000 no está ocupado
- [ ] Dependencias instaladas correctamente
- [ ] No hay errores de compilación de TypeScript

### Login falla

- [ ] Callback URLs están correctamente configuradas en Cognito
- [ ] Client ID coincide entre frontend y backend
- [ ] User Pool ID es correcto
- [ ] Dominio de Cognito es correcto
- [ ] Usuario existe y tiene credenciales válidas

### Token exchange falla

- [ ] Backend está corriendo
- [ ] `VITE_BACKEND_URL` apunta a `http://localhost:3001`
- [ ] CORS está configurado correctamente en backend
- [ ] Client ID en backend coincide con el del frontend
- [ ] Firebase service account es válido

### Firebase authentication falla

- [ ] Service account tiene permisos correctos
- [ ] Firebase project ID es correcto
- [ ] Firebase Authentication está habilitado
- [ ] Custom token no ha expirado (max 1 hora)

---

## ✨ Checklist Final

Antes de considerar la POC completa:

- [ ] Login funciona correctamente
- [ ] Usuario queda autenticado en Cognito
- [ ] Usuario queda autenticado en Firebase
- [ ] Se muestra información del usuario en la UI
- [ ] Logout funciona en ambos sistemas
- [ ] No hay errores en consola (backend ni frontend)
- [ ] Health check del backend responde correctamente
- [ ] Todos los logs esperados aparecen
- [ ] Has probado con al menos un usuario

---

## 📚 Documentación Revisada

- [ ] `README.md` - Información general
- [ ] `SETUP_GUIDE.md` - Guía detallada de configuración
- [ ] `EXECUTIVE_SUMMARY.md` - Resumen ejecutivo
- [ ] `QUICK_REFERENCE.md` - Comandos rápidos
- [ ] `backend/README.md` - Documentación del backend
- [ ] `frontend/README.md` - Documentación del frontend

---

## 🎉 ¡Felicidades!

Si todos los checkboxes están marcados, tu POC6 está completamente configurada y funcionando correctamente.

**Próximos pasos sugeridos:**

1. Probar diferentes flujos de usuario
2. Revisar los logs para entender el flujo completo
3. Experimentar con servicios de Firebase (Firestore, Storage, etc.)
4. Considerar mejoras para producción (ver EXECUTIVE_SUMMARY.md)

---

**Última actualización**: Octubre 2025
