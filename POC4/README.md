# POC4 - Firebase + Cognito OIDC Authentication

Esta POC demuestra la integración de Firebase Authentication con AWS Cognito usando OIDC (OpenID Connect).

## 🎯 Arquitectura

**Firebase Auth UI → Cognito Pool Central (OIDC) → Firebase ID Token**

Firebase actúa como la interfaz de autenticación, pero valida las credenciales contra el Pool Centralizado de Cognito usando OIDC.

## 📊 Flujos de Autenticación

### Opción 1: Firebase + Cognito OIDC
```
Usuario → Firebase Auth UI → Cognito (OIDC) → Firebase valida → Firebase ID Token → Aplicación
```

**Características:**
- ✅ UI de Firebase Authentication
- ✅ Validación de usuarios en Cognito Pool Central
- ✅ Firebase ID Token como resultado
- ✅ Centralización de usuarios en Cognito

### Opción 2: Cognito Hosted UI Direct
```
Usuario → Cognito Hosted UI → Cognito Pool Central → AWS Credentials → Aplicación
```

**Características:**
- ✅ Hosted UI de Cognito
- ✅ Tokens de Cognito (ID, Access, Refresh)
- ✅ AWS Credentials via Identity Pool
- ✅ Sin Firebase en el flujo

---

## ⚙️ Configuración

### 1. Configurar OIDC Provider en Firebase

**En Firebase Console:**
1. Ve a: https://console.firebase.google.com/project/semiotic-runner-473916-v5/authentication/providers
2. Click en **Add new provider**
3. Selecciona **OpenID Connect**
4. Completa:
   - **Provider ID**: `cognitocentral` (debe coincidir con el código)
   - **Provider name**: Cognito Central Pool
   - **Client ID**: `6bttup877q2dstrvu77r8v469q`
   - **Client Secret**: `llp7m5ojfb1hpv59o0vq7lis17hce8hijn2gd9jds1q4jj7173a`
   - **Issuer (URL)**: `https://cognito-idp.us-east-2.amazonaws.com/us-east-2_CpAkinT1i`
5. Click **Save**
6. **Copia el Callback URL** que Firebase genera

### 2. Actualizar Cognito App Client

Agrega el callback URL de Firebase a tu App Client de Cognito:

```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id us-east-2_CpAkinT1i \
  --client-id 6bttup877q2dstrvu77r8v469q \
  --callback-urls \
    "https://semiotic-runner-473916-v5.firebaseapp.com/__/auth/handler" \
    "http://localhost:3002" \
  --logout-urls \
    "https://semiotic-runner-473916-v5.firebaseapp.com" \
    "http://localhost:3002" \
  --allowed-o-auth-flows "code" \
  --allowed-o-auth-scopes "openid" "email" "profile" \
  --allowed-o-auth-flows-user-pool-client \
  --region us-east-2
```

### 3. Habilitar localhost en Firebase

**Authorized domains:**
1. Firebase Console → Authentication → Settings
2. Scroll a **Authorized domains**
3. Click **Add domain**
4. Agrega: `localhost`
5. Save

### 4. Variables de Entorno

Archivo `.env` (ya configurado):
```env
VITE_COGNITO_REGION=us-east-2
VITE_COGNITO_USER_POOL_ID=us-east-2_CpAkinT1i
VITE_COGNITO_CLIENT_ID=6bttup877q2dstrvu77r8v469q
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:31e4f0a0-2e2c-47e9-8d20-8774ba50a770
VITE_COGNITO_DOMAIN=https://us-east-2cpakint1i.auth.us-east-2.amazoncognito.com
```

---

## 🚀 Ejecutar POC4

### 1. Instalar Dependencias
```bash
cd POC4
pnpm install
```

### 2. Iniciar Aplicación
```bash
pnpm dev
```

Aplicación disponible en: **http://localhost:3002**

---

## 🧪 Probar los Flujos

### Flujo 1: Firebase + Cognito OIDC

1. Click en "Iniciar con Firebase"
2. La aplicación redireccionará a Firebase Auth
3. Firebase redirige a Cognito para autenticación (OIDC)
4. Usuario ingresa credenciales en Cognito
5. Cognito valida y regresa a Firebase
6. Firebase genera ID Token
7. Usuario autenticado en la aplicación

**Nota importante:** Este flujo usa redirecciones completas (no popups) porque el flujo OIDC requiere múltiples redirects entre Firebase → Cognito → Firebase. La aplicación se recargará automáticamente después de la autenticación exitosa.
5. Cognito valida y retorna token a Firebase
6. Firebase genera ID Token
7. Aplicación recibe usuario autenticado

### Flujo 2: Cognito Hosted UI

1. Click en "Iniciar con Cognito"
2. Redirige a Cognito Hosted UI
3. Usuario se autentica
4. Retorna a la aplicación con tokens de Cognito
5. Aplicación obtiene AWS Credentials

---

## 🔧 Detalles Técnicos

### Código clave en hybridAuth.ts

```typescript
// Firebase con Cognito OIDC - usando redirect
const provider = new OAuthProvider('oidc.cognitonuevo');
await signInWithRedirect(auth, provider);

// Al regresar, verificar resultado
const result = await getRedirectResult(auth);
```

El Provider ID `oidc.cognitonuevo` debe coincidir con el configurado en Firebase Console.

**Importante:** Se usa `signInWithRedirect` en lugar de `signInWithPopup` porque el flujo OIDC requiere múltiples redirecciones (Firebase → Cognito → Firebase) que no funcionan correctamente en popups.

### Tokens obtenidos

**Flujo Firebase + Cognito OIDC:**
- Firebase ID Token (JWT)
  - Issuer: Firebase
  - Validado contra: Cognito
  - Claims: user info de Cognito

**Flujo Cognito Direct:**
- Cognito ID Token (JWT)
- Cognito Access Token
- AWS Temporary Credentials

---

## 🎯 Ventajas de este Enfoque

✅ **UI/UX de Firebase** con **seguridad de Cognito**  
✅ **Centralización de usuarios** en Cognito  
✅ **Gestión unificada** de usuarios entre AWS y Firebase  
✅ **Compliance** - Usuarios auditados en Cognito  
✅ **Flexibilidad** - Dos opciones de autenticación

---

## 🔍 Troubleshooting

### Error: `auth/popup-closed-by-user`
- **Causa:** Intentar usar popup para flujo OIDC con múltiples redirects
- **Solución:** El código ya usa `signInWithRedirect` - la app se recargará automáticamente después del login

### Error: `auth/operation-not-allowed`
- Verifica que el OIDC Provider esté habilitado en Firebase
- Provider ID debe ser `cognitocentral`

### Error: `redirect_uri_mismatch`
- Verifica callback URLs en Cognito App Client
- Debe incluir: `https://semiotic-runner-473916-v5.firebaseapp.com/__/auth/handler`

### Popup bloqueado
- Permite popups para localhost:3002 en tu navegador

### Error: `auth/unauthorized-domain`
- Agrega `localhost` a Authorized domains en Firebase

---

## 📚 Documentación Adicional

- **CONFIGURACION.md** - Guía detallada de configuración
- **DIAGRAMAS.md** - Diagramas de arquitectura para presentación
