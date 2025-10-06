# POC4 - Firebase + Cognito Authentication

Esta POC demuestra la integración híbrida entre Firebase/GCP y AWS Cognito.

## Arquitectura

- **Firebase Authentication** con Google Sign-In
- **AWS Cognito User Pool** (Centralizado) como Identity Provider
- **AWS Cognito Identity Pool** para credenciales de AWS

## Flujos de Autenticación

### Opción 1: Firebase Directo
Usuario → Firebase (Google Sign-In) → JWT Token → Aplicación

### Opción 2: Via Cognito (Federado)
Usuario → Firebase (Google Sign-In) → Google IdP en Cognito → Cognito Pool Central → AWS Credentials → Aplicación

## Configuración

1. Instalar dependencias:
```bash
pnpm install
```

2. Configurar variables de entorno en `.env`:
```
VITE_COGNITO_REGION=us-east-2
VITE_COGNITO_USER_POOL_ID=us-east-2_CpAkinT1i
VITE_COGNITO_CLIENT_ID=6bttup877q2dstrvu77r8v469q
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:31e4f0a0-2e2c-47e9-8d20-8774ba50a770
VITE_COGNITO_DOMAIN=https://us-east-2cpakint1i.auth.us-east-2.amazoncognito.com
```

3. Ejecutar en desarrollo:
```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3002`

## Configuración en Google Cloud Platform

1. Ir a Google Cloud Console → APIs & Services → Credentials
2. Crear OAuth 2.0 Client ID
3. Agregar Authorized redirect URIs:
   - `http://localhost:3002`
   - `https://us-east-2cpakint1i.auth.us-east-2.amazoncognito.com/oauth2/idpresponse`

## Configuración en AWS Cognito

1. Crear Google Identity Provider en el Pool Centralizado:
```bash
aws cognito-idp create-identity-provider \
  --user-pool-id us-east-2_CpAkinT1i \
  --provider-name Google \
  --provider-type Google \
  --provider-details "client_id=YOUR_GOOGLE_CLIENT_ID,client_secret=YOUR_GOOGLE_CLIENT_SECRET,authorize_scopes=openid email profile" \
  --attribute-mapping "username=sub,email=email"
```

2. Actualizar App Client para usar Google IdP:
```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id us-east-2_CpAkinT1i \
  --client-id 6bttup877q2dstrvu77r8v469q \
  --supported-identity-providers Google
```
