# 🚀 POC Login User Cognito - Workspace Completo

Este repositorio contiene múltiples POCs (Pruebas de Concepto) para diferentes flujos de autenticación con AWS Cognito y Firebase.

## 📁 Estructura del Proyecto

```
poc_login_user_cognito/
├── POC_CDK_COGNITO/    # Infraestructura de Cognito con CDK
├── POC2/               # Login con Hosted UI básico
├── POC3/               # Login con Hosted UI + Identity Pool
├── POC4/               # Autenticación híbrida Cognito + Firebase (OIDC)
├── POC5/               # Login directo sin Hosted UI
└── POC6/               # 🆕 Login unificado Cognito + Firebase (Custom Tokens)
```

---

## 🎯 POC6: Login Unificado Cognito + Firebase

**La POC más completa** - Sistema de autenticación unificado que combina AWS Cognito (autenticación centralizada) con Firebase (servicios backend).

### ✨ Características

- ✅ Single Sign-On entre Cognito y Firebase
- ✅ Backend bridge que valida tokens y genera custom tokens
- ✅ Usuario se autentica una sola vez
- ✅ Acceso a servicios de AWS y Firebase simultáneamente
- ✅ Sincronización automática de usuarios

### 🚀 Quick Start POC6

```bash
cd POC6
./install.sh
```

Luego sigue las instrucciones en `POC6/SETUP_GUIDE.md`

### 📚 Documentación POC6

- **[README.md](POC6/README.md)** - Información general
- **[SETUP_GUIDE.md](POC6/SETUP_GUIDE.md)** - Guía paso a paso completa
- **[EXECUTIVE_SUMMARY.md](POC6/EXECUTIVE_SUMMARY.md)** - Resumen ejecutivo
- **[QUICK_REFERENCE.md](POC6/QUICK_REFERENCE.md)** - Comandos rápidos
- **[CHECKLIST.md](POC6/CHECKLIST.md)** - Checklist de configuración

---

## 🏗️ POC_CDK_COGNITO - Infraestructura

Este proyecto crea un User Pool de Cognito para probar:

- Flujo Hosted UI (Authorization Code + PKCE) con scopes `openid email profile`.
- Flujo directo de password (para la POC1) usando otro App Client.
- Múltiples callback/logout URLs para desarrollo local y despliegue.

### Estructura
- `bin/poc-cdk-cognito.ts`: Punto de entrada CDK.
- `lib/cognito-poc-stack.ts`: Define el User Pool, dominio y clientes.

## Recursos creados
1. User Pool con:
   - selfSignUpEnabled
   - email como atributo obligatorio
   - password policy básica
2. Dominio cognito automático (prefijo derivado de la cuenta)
3. App Client Hosted UI (sin secret, code grant, PKCE)
4. App Client Directo (para login usuario/clave)
5. Outputs con IDs y URLs

## Despliegue
Asegúrate de tener variables de entorno AWS o perfil configurado.

Instalar dependencias:
```
pnpm -F poc-cdk-cognito install
```

Synth:
```
pnpm -F poc-cdk-cognito run synth
```

Deploy:
```
pnpm -F poc-cdk-cognito run deploy
```

## Uso de outputs
Los outputs te darán:
- UserPoolId => VITE_COGNITO_USER_POOL_ID
- HostedClientId => VITE_COGNITO_HOSTED_CLIENT_ID
- DirectClientId => uno de los clients para POC1
- HostedDomain => VITE_COGNITO_DOMAIN (quitar https:// al usarlo en config frontend)
- CallbackUrls/LogoutUrls => para tus variables de redirect (separar por comas)

## Ajustes posteriores
- Cambia las URLs placeholder `https://example-cloudfront-domain.net/` por tu dominio real.
- Agrega Identity Providers sociales si lo necesitas (Google, etc.) actualizando `supportedIdentityProviders` y oAuth scopes.

## Limpieza
```
pnpm -F poc-cdk-cognito run destroy
```

