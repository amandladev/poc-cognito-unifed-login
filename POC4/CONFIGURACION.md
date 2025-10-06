# Configuración de POC4 - Firebase + Cognito

## 📋 Resumen
POC4 implementa autenticación híbrida usando Firebase/GCP y AWS Cognito, demostrando dos flujos:
1. **Firebase Direct**: Autenticación directa con Firebase
2. **Via Cognito**: Firebase/Google como Identity Provider federado en Cognito

---

## 🔧 Configuración en Google Cloud Platform

### 1. Habilitar Google Sign-In API

```bash
# En tu proyecto: semiotic-runner-473916-v5
gcloud services enable iap.googleapis.com
```

### 2. Crear OAuth 2.0 Client ID

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto: `semiotic-runner-473916-v5`
3. Ve a **APIs & Services** → **Credentials**
4. Click en **Create Credentials** → **OAuth client ID**
5. Tipo de aplicación: **Web application**
6. Nombre: `POC4-Firebase-Cognito`

### 3. Configurar Authorized Redirect URIs

Agrega las siguientes URIs:
```
http://localhost:3002
http://localhost:3002/callback
https://us-east-2cpakint1i.auth.us-east-2.amazoncognito.com/oauth2/idpresponse
```

### 4. Obtener Credenciales

Después de crear el Client ID, obtendrás:
- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxx`

**⚠️ GUARDA ESTAS CREDENCIALES - Las necesitarás para AWS**

---

## ☁️ Configuración en AWS Cognito

### 1. Crear Google Identity Provider en Pool Centralizado

```bash
# Reemplaza YOUR_GOOGLE_CLIENT_ID y YOUR_GOOGLE_CLIENT_SECRET
aws cognito-idp create-identity-provider \
  --user-pool-id us-east-2_CpAkinT1i \
  --provider-name Google \
  --provider-type Google \
  --provider-details \
    client_id=YOUR_GOOGLE_CLIENT_ID,\
    client_secret=YOUR_GOOGLE_CLIENT_SECRET,\
    authorize_scopes="openid email profile" \
  --attribute-mapping \
    username=sub,\
    email=email,\
    name=name,\
    picture=picture \
  --region us-east-2
```

### 2. Actualizar App Client

```bash
# Agregar Google como proveedor soportado
aws cognito-idp update-user-pool-client \
  --user-pool-id us-east-2_CpAkinT1i \
  --client-id 6bttup877q2dstrvu77r8v469q \
  --supported-identity-providers Google \
  --callback-urls "http://localhost:3002" "http://localhost:3002/callback" \
  --logout-urls "http://localhost:3002" \
  --allowed-o-auth-flows "code" \
  --allowed-o-auth-scopes "openid" "email" "profile" \
  --allowed-o-auth-flows-user-pool-client \
  --region us-east-2
```

### 3. Verificar Configuración del Identity Provider

```bash
aws cognito-idp describe-identity-provider \
  --user-pool-id us-east-2_CpAkinT1i \
  --provider-name Google \
  --region us-east-2
```

Deberías ver:
```json
{
  "IdentityProvider": {
    "UserPoolId": "us-east-2_CpAkinT1i",
    "ProviderName": "Google",
    "ProviderType": "Google",
    "ProviderDetails": {
      "client_id": "xxxxx.apps.googleusercontent.com",
      "authorize_scopes": "openid email profile"
    },
    "AttributeMapping": {
      "username": "sub",
      "email": "email"
    }
  }
}
```

### 4. Verificar App Client

```bash
aws cognito-idp describe-user-pool-client \
  --user-pool-id us-east-2_CpAkinT1i \
  --client-id 6bttup877q2dstrvu77r8v469q \
  --region us-east-2
```

Verifica que `SupportedIdentityProviders` incluya "Google"

---

## 🚀 Ejecutar POC4

### 1. Instalar Dependencias

```bash
cd POC4
pnpm install
```

### 2. Configurar Variables de Entorno

El archivo `.env` ya está configurado con:
```env
VITE_COGNITO_REGION=us-east-2
VITE_COGNITO_USER_POOL_ID=us-east-2_CpAkinT1i
VITE_COGNITO_CLIENT_ID=6bttup877q2dstrvu77r8v469q
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:31e4f0a0-2e2c-47e9-8d20-8774ba50a770
VITE_COGNITO_DOMAIN=https://us-east-2cpakint1i.auth.us-east-2.amazoncognito.com
```

### 3. Iniciar Aplicación

```bash
pnpm dev
```

La aplicación estará disponible en: **http://localhost:3002**

---

## 🧪 Probar los Flujos

### Flujo 1: Firebase Direct

1. Click en "Iniciar con Firebase"
2. Se abrirá popup de Google Sign-In
3. Selecciona tu cuenta de Google
4. Verás los datos del usuario de Firebase
5. El token es un JWT de Firebase

### Flujo 2: Via Cognito (Federado)

1. Click en "Iniciar via Cognito"
2. Redirige al Hosted UI de Cognito
3. Cognito usa Google como IdP
4. Después del login, redirige de vuelta a la app
5. Verás tokens de Cognito + AWS Credentials

---

## 📊 Diagrama de Arquitectura

### Firebase Direct
```
┌─────────┐     ┌──────────┐     ┌─────────────┐     ┌─────────────┐
│ Usuario │────→│  Google  │────→│   Firebase  │────→│  Aplicación │
└─────────┘     └──────────┘     └─────────────┘     └─────────────┘
                                       │
                                       ↓
                                   JWT Token
```

### Via Cognito (Federado)
```
┌─────────┐     ┌──────────┐     ┌──────────────────┐     ┌──────────────┐
│ Usuario │────→│  Google  │────→│  Cognito IdP     │────→│   Cognito    │
└─────────┘     └──────────┘     │  (Google)        │     │  Pool Central│
                                  └──────────────────┘     └──────────────┘
                                                                   │
                                                                   ↓
                                                           ┌───────────────┐
                                                           │   Identity    │
                                                           │     Pool      │
                                                           └───────────────┘
                                                                   │
                                                                   ↓
                                                           AWS Credentials
                                                                   │
                                                                   ↓
                                                           ┌─────────────┐
                                                           │  Aplicación │
                                                           └─────────────┘
```

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"
- Verifica que las redirect URIs estén configuradas en Google Cloud Console
- Deben coincidir exactamente (incluye http:// o https://)

### Error: "Invalid identity pool configuration"
- Verifica que el Identity Pool tenga roles de IAM asignados:
  - `Cognito_EstarBienAuth_Role` (Authenticated)
  - `Cognito_EstarBienUnauth_Role` (Unauthenticated)

### Error: "User is not authenticated"
- Limpia cookies y localStorage
- Intenta nuevamente el flujo de login

### Firebase popup bloqueado
- Permite popups para localhost:3002 en tu navegador
- O usa `signInWithRedirect` en lugar de `signInWithPopup`

---

## 📝 Notas Importantes

1. **Seguridad**: El Client Secret de Google debe mantenerse seguro. En producción, usa variables de entorno del servidor.

2. **CORS**: Si usas un dominio diferente a localhost, configura CORS en Cognito.

3. **Tokens**: Los tokens de Firebase y Cognito tienen diferentes estructuras y claims. Verifica según tu necesidad.

4. **AWS Credentials**: Solo el flujo "Via Cognito" proporciona credenciales temporales de AWS.

5. **Multi-Region**: El Identity Pool está en us-east-1, pero el User Pool en us-east-2. Esto es intencional para la demostración.

---

## 🎯 Próximos Pasos

- [ ] Configurar Google OAuth Client en GCP
- [ ] Crear Google Identity Provider en Cognito
- [ ] Probar flujo Firebase Direct
- [ ] Probar flujo Via Cognito
- [ ] Verificar AWS Credentials en flujo federado
- [ ] Documentar diferencias entre tokens
