# Diagramas POC4 - Firebase + Cognito

## 🎨 Diagrama 1: Arquitectura General

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        POC4 - ARQUITECTURA HÍBRIDA                            ║
║                      Firebase/GCP ←→ AWS Cognito                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                           🌐 GOOGLE CLOUD PLATFORM                           │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Project: semiotic-runner-473916-v5                                 │    │
│  │                                                                      │    │
│  │  ┌──────────────────┐         ┌─────────────────────────┐          │    │
│  │  │ OAuth 2.0        │         │ Firebase Authentication │          │    │
│  │  │ Client ID        │◄────────┤ - Google Sign-In        │          │    │
│  │  │                  │         │ - JWT Tokens            │          │    │
│  │  └──────────────────┘         └─────────────────────────┘          │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ OIDC Federation
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ☁️  AWS CLOUD                                   │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Region: us-east-2 (Ohio)                                           │    │
│  │                                                                      │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │ 🔐 Cognito User Pool: us-east-2_CpAkinT1i (Centralizado)   │   │    │
│  │  │                                                              │   │    │
│  │  │  ┌────────────────────────────────────────────┐            │   │    │
│  │  │  │ Identity Providers:                         │            │   │    │
│  │  │  │  • Google (OIDC)                           │            │   │    │
│  │  │  │    - Issuer: accounts.google.com           │            │   │    │
│  │  │  │    - Client ID: xxx.apps.googleusercontent │            │   │    │
│  │  │  │    - Scopes: openid, email, profile        │            │   │    │
│  │  │  └────────────────────────────────────────────┘            │   │    │
│  │  │                                                              │   │    │
│  │  │  ┌────────────────────────────────────────────┐            │   │    │
│  │  │  │ App Client: 6bttup877q2dstrvu77r8v469q     │            │   │    │
│  │  │  │  • Supported IdPs: [Google]                │            │   │    │
│  │  │  │  • OAuth Flows: Authorization Code + PKCE  │            │   │    │
│  │  │  │  • Scopes: openid, email, profile          │            │   │    │
│  │  │  └────────────────────────────────────────────┘            │   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Region: us-east-1 (Virginia)                                       │    │
│  │                                                                      │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │ 🎫 Cognito Identity Pool                                    │   │    │
│  │  │ ID: us-east-1:31e4f0a0-2e2c-47e9-8d20-8774ba50a770         │   │    │
│  │  │                                                              │   │    │
│  │  │  ┌────────────────────────────────────────────┐            │   │    │
│  │  │  │ IAM Roles:                                  │            │   │    │
│  │  │  │  • Authenticated: Cognito_EstarBienAuth_Role│            │   │    │
│  │  │  │  • Unauthenticated: Cognito_EstarBienUnauth │            │   │    │
│  │  │  └────────────────────────────────────────────┘            │   │    │
│  │  │                                                              │   │    │
│  │  │  Provides: AWS Temporary Credentials                        │   │    │
│  │  │  (AccessKeyId, SecretKey, SessionToken)                     │   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                       💻 POC4 Application (React + Vite)                     │
│                          Port: 3002 (localhost)                              │
│                                                                              │
│  • Firebase SDK: Direct Google Sign-In                                      │
│  • AWS Amplify v6: Cognito Integration                                      │
│  • Dual Authentication Modes                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Diagrama 2: Flujo de Autenticación - Firebase Direct

```
FLUJO 1: FIREBASE DIRECT (Sin Cognito)
════════════════════════════════════════

┌─────────┐                                    
│         │  1. Click "Iniciar con Firebase"
│ Usuario │────────────────────────────────────┐
│         │                                    │
└─────────┘                                    ↓
     ↑                              ┌──────────────────────┐
     │                              │  POC4 Frontend       │
     │                              │  (React App)         │
     │                              │                      │
     │                              │  Firebase SDK        │
     │                              │  signInWithPopup()   │
     │                              └──────────────────────┘
     │                                         │
     │                                         │ 2. Abre popup
     │                                         ↓
     │                              ┌──────────────────────┐
     │                              │  Google Sign-In      │
     │                              │  (accounts.google    │
     │         3. Selecciona        │   .com)              │
     │            Cuenta            │                      │
     │◄─────────────────────────────┤  OAuth 2.0 Consent  │
     │                              └──────────────────────┘
     │                                         │
     │                                         │ 4. Autoriza
     │                                         ↓
     │                              ┌──────────────────────┐
     │                              │  Firebase Auth       │
     │                              │  (GCP)               │
     │                              │                      │
     │         5. JWT Token         │  ✓ Valida usuario    │
     │◄─────────────────────────────┤  ✓ Genera token      │
     │                              └──────────────────────┘
     │
     │ 6. Usuario autenticado
     │    - displayName
     │    - email
     │    - uid
     │    - Firebase JWT
     ↓
┌─────────────────────┐
│  Aplicación POC4    │
│  Estado: Logged In  │
│  Modo: Firebase     │
└─────────────────────┘

TOKENS OBTENIDOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Firebase JWT Token
  - Issuer: https://securetoken.google.com/semiotic-runner-473916-v5
  - Claims: email, name, picture, user_id
  - Válido para: Firebase services
  
✗ NO incluye credenciales de AWS
```

---

## 🔄 Diagrama 3: Flujo de Autenticación - Via Cognito

```
FLUJO 2: VIA COGNITO (Federado con Google)
════════════════════════════════════════════

┌─────────┐                                    
│         │  1. Click "Iniciar via Cognito"
│ Usuario │────────────────────────────────────┐
│         │                                    │
└─────────┘                                    ↓
     ↑                              ┌──────────────────────────────┐
     │                              │  POC4 Frontend               │
     │                              │  (React App)                 │
     │                              │                              │
     │                              │  AWS Amplify                 │
     │                              │  signInWithRedirect({        │
     │                              │    provider: 'Google'        │
     │                              │  })                          │
     │                              └──────────────────────────────┘
     │                                         │
     │                                         │ 2. Redirige a Cognito
     │                                         ↓
     │                              ┌──────────────────────────────┐
     │                              │  Cognito Hosted UI           │
     │                              │  us-east-2cpakint1i.auth     │
     │                              │   .us-east-2.amazoncognito   │
     │         3. Auto-redirige     │   .com                       │
     │            a Google          │                              │
     │◄─────────────────────────────┤  OAuth 2.0 Endpoint          │
     │                              └──────────────────────────────┘
     │                                         │
     │                                         │ 4. Redirect
     │                                         ↓
     │                              ┌──────────────────────────────┐
     │                              │  Google Sign-In              │
     │                              │  (accounts.google.com)       │
     │         5. Selecciona        │                              │
     │            Cuenta            │  OAuth 2.0 Consent Screen    │
     │◄─────────────────────────────┤                              │
     │                              └──────────────────────────────┘
     │                                         │
     │                                         │ 6. Autoriza + Google Token
     │                                         ↓
     │                              ┌──────────────────────────────┐
     │                              │  Cognito User Pool           │
     │                              │  us-east-2_CpAkinT1i         │
     │                              │                              │
     │         7. Auth Code         │  ✓ Valida Google token       │
     │◄─────────────────────────────┤  ✓ Crea/actualiza usuario    │
     │                              │  ✓ Genera Cognito tokens     │
     │                              └──────────────────────────────┘
     │                                         │
     │                                         │ 8. Cognito Tokens
     │                                         ↓
     │                              ┌──────────────────────────────┐
     │                              │  POC4 Frontend               │
     │                              │                              │
     │                              │  fetchAuthSession()          │
     │                              └──────────────────────────────┘
     │                                         │
     │                                         │ 9. Exchange tokens
     │                                         ↓
     │                              ┌──────────────────────────────┐
     │                              │  Cognito Identity Pool       │
     │                              │  us-east-1:31e4f0a0...       │
     │        10. AWS Credentials   │                              │
     │◄─────────────────────────────┤  ✓ Valida Cognito tokens     │
     │                              │  ✓ Asume IAM Role            │
     │                              │  ✓ Genera credenciales       │
     │                              └──────────────────────────────┘
     │
     │ 11. Usuario autenticado + AWS Access
     │    - Username (sub from Google)
     │    - Email
     │    - Cognito ID Token
     │    - Cognito Access Token
     │    - AWS AccessKeyId
     │    - AWS SecretAccessKey
     │    - AWS SessionToken
     ↓
┌──────────────────────────┐
│  Aplicación POC4         │
│  Estado: Logged In       │
│  Modo: Via Cognito       │
│  AWS: ✓ Credentials OK   │
└──────────────────────────┘

TOKENS OBTENIDOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Cognito ID Token (JWT)
  - Issuer: https://cognito-idp.us-east-2.amazonaws.com/us-east-2_CpAkinT1i
  - Claims: email, cognito:username, identities (Google)
  - Válido para: Identificación de usuario

✓ Cognito Access Token (JWT)
  - Válido para: Acceso a recursos de Cognito
  - Scopes: openid, email, profile

✓ AWS Credentials (Temporal)
  - AccessKeyId: ASIA...
  - SecretAccessKey: ...
  - SessionToken: ...
  - Válido para: Acceso a servicios de AWS (S3, DynamoDB, etc.)
  - Expira en: 1 hora (configurable)
```

---

## 📊 Diagrama 4: Comparación de Flujos

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                         COMPARACIÓN DE FLUJOS                              ║
╚═══════════════════════════════════════════════════════════════════════════╝

┌────────────────────────────────┬──────────────────────────────────────────┐
│      FIREBASE DIRECT           │          VIA COGNITO                     │
├────────────────────────────────┼──────────────────────────────────────────┤
│                                │                                          │
│  Componentes:                  │  Componentes:                            │
│  • Google OAuth                │  • Google OAuth                          │
│  • Firebase Auth               │  • Firebase (como IdP)                   │
│                                │  • Cognito User Pool                     │
│                                │  • Cognito Identity Pool                 │
│                                │                                          │
│  Tokens Generados:             │  Tokens Generados:                       │
│  • Firebase JWT                │  • Cognito ID Token (JWT)                │
│                                │  • Cognito Access Token (JWT)            │
│                                │  • AWS Temporary Credentials             │
│                                │                                          │
│  Acceso a:                     │  Acceso a:                               │
│  • Firebase Services           │  • Cognito APIs                          │
│  • Google APIs                 │  • AWS Services (S3, DynamoDB, etc.)     │
│                                │  • Firebase Services                     │
│                                │  • Google APIs                           │
│                                │                                          │
│  Ventajas:                     │  Ventajas:                               │
│  ✓ Simple y directo            │  ✓ Integración con AWS                   │
│  ✓ Menos latencia              │  ✓ AWS Credentials automáticas           │
│  ✓ UI de Google nativa         │  ✓ Centralización de usuarios            │
│                                │  ✓ Políticas IAM aplicadas               │
│                                │  ✓ SSO con otras apps Cognito            │
│                                │                                          │
│  Casos de uso:                 │  Casos de uso:                           │
│  • Apps solo Firebase/GCP      │  • Apps híbridas AWS + GCP               │
│  • Prototipado rápido          │  • Arquitecturas multi-cloud             │
│  • Apps sin AWS                │  • Requerimientos de compliance          │
│                                │  • Necesidad de AWS services             │
│                                │                                          │
│  Tiempo de auth: ~2-3s         │  Tiempo de auth: ~4-6s                   │
│                                │                                          │
└────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 🎯 Diagrama 5: Casos de Uso

```
CUÁNDO USAR CADA FLUJO
══════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│  FIREBASE DIRECT                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✓ Aplicación web/móvil que solo usa servicios de GCP          │
│  ✓ Prototipado rápido de autenticación                         │
│  ✓ No necesitas integración con AWS                            │
│  ✓ Quieres la UI de Google Sign-In nativa                      │
│  ✓ Presupuesto limitado (Firebase tiene tier gratuito)         │
│  ✓ Equipo familiarizado con Firebase                           │
│                                                                  │
│  EJEMPLO:                                                        │
│  "App móvil de delivery que usa Firestore y Cloud Functions"   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  VIA COGNITO (FEDERADO)                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✓ Aplicación que usa servicios tanto de AWS como GCP          │
│  ✓ Necesitas acceso a S3, DynamoDB, Lambda, etc.               │
│  ✓ Requerimientos de compliance (HIPAA, SOC2)                  │
│  ✓ Arquitectura multi-cloud                                     │
│  ✓ Single Sign-On entre múltiples aplicaciones                 │
│  ✓ Centralización de usuarios en Cognito                       │
│  ✓ Necesitas aplicar políticas IAM granulares                  │
│                                                                  │
│  EJEMPLO:                                                        │
│  "Plataforma empresarial con frontend en GCP, backend en AWS,  │
│   que necesita acceso a S3 para almacenar archivos y BigQuery  │
│   para analytics"                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  HÍBRIDO (AMBOS)                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✓ Ofrecer opciones a los usuarios                             │
│  ✓ Migración gradual de Firebase a AWS                         │
│  ✓ A/B testing de flujos de autenticación                      │
│  ✓ Diferentes tiers de usuarios (free vs premium)              │
│                                                                  │
│  EJEMPLO:                                                        │
│  "SaaS que ofrece tier gratuito con Firebase y tier enterprise │
│   con acceso a servicios AWS avanzados"                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Diagrama 6: Flujo de Tokens

```
TOKEN LIFECYCLE - VIA COGNITO
════════════════════════════════════════════════════════════════

  1. GOOGLE TOKEN
  ┌────────────────────────────────────────────────┐
  │ issuer: "https://accounts.google.com"          │
  │ aud: "xxxxx.apps.googleusercontent.com"        │
  │ email: "user@example.com"                      │
  │ email_verified: true                           │
  │ name: "John Doe"                               │
  │ picture: "https://..."                         │
  │ sub: "1234567890"                              │
  └────────────────────────────────────────────────┘
           │
           │ Exchange en Cognito User Pool
           ↓
  2. COGNITO ID TOKEN
  ┌────────────────────────────────────────────────┐
  │ issuer: "https://cognito-idp.us-east-2         │
  │         .amazonaws.com/us-east-2_CpAkinT1i"    │
  │ aud: "6bttup877q2dstrvu77r8v469q"              │
  │ cognito:username: "Google_1234567890"          │
  │ email: "user@example.com"                      │
  │ identities: [                                  │
  │   {                                            │
  │     userId: "1234567890",                      │
  │     providerName: "Google",                    │
  │     providerType: "Google",                    │
  │     primary: true                              │
  │   }                                            │
  │ ]                                              │
  └────────────────────────────────────────────────┘
           │
           │ Exchange en Identity Pool
           ↓
  3. AWS TEMPORARY CREDENTIALS
  ┌────────────────────────────────────────────────┐
  │ AccessKeyId: "ASIA..."                         │
  │ SecretAccessKey: "..."                         │
  │ SessionToken: "FwoGZ..."                       │
  │ Expiration: 2024-xx-xx 12:00:00 (1 hora)      │
  │                                                │
  │ AssumedRoleArn:                                │
  │  "arn:aws:iam::211125470023:role/             │
  │   Cognito_EstarBienAuth_Role"                  │
  │                                                │
  │ Permissions: (según IAM Policy)                │
  │  • s3:GetObject, s3:PutObject                 │
  │  • dynamodb:GetItem, dynamodb:PutItem         │
  │  • etc.                                        │
  └────────────────────────────────────────────────┘
```

---

## 📐 Diagrama 7: Arquitectura de Código POC4

```
POC4 - ESTRUCTURA DE CÓDIGO
════════════════════════════════════════════════════════════

POC4/
│
├── src/
│   ├── config/
│   │   ├── firebaseConfig.ts          🔥 Firebase initialization
│   │   │   • initializeApp()
│   │   │   • getAuth()
│   │   │   • GoogleAuthProvider()
│   │   │
│   │   └── cognitoConfig.ts           ☁️  Cognito configuration
│   │       • Amplify.configure()
│   │       • OAuth settings
│   │       • Identity Pool ID
│   │
│   ├── auth/
│   │   ├── hybridAuth.ts              🔄 Hybrid authentication logic
│   │   │   • signInWithFirebase()    → Firebase Direct
│   │   │   • signInViaCognito()      → Cognito Federated
│   │   │   • getCognitoUser()
│   │   │   • signOut()
│   │   │
│   │   └── AuthContext.tsx            📦 React Context
│   │       • AuthProvider
│   │       • useAuth() hook
│   │       • State management
│   │
│   ├── ui/
│   │   ├── App.tsx                    🎨 Main UI component
│   │   │   • Login options
│   │   │   • User info display
│   │   │   • Mode indicator
│   │   │
│   │   └── App.css                    💅 Orange/Yellow theme
│   │       • Gradients
│   │       • Animations
│   │       • Responsive design
│   │
│   ├── main.tsx                       🚀 Entry point
│   │   • ReactDOM.render()
│   │   • AuthProvider wrapper
│   │
│   └── env.d.ts                       📝 TypeScript definitions
│
├── .env                               🔐 Environment variables
│   • VITE_COGNITO_USER_POOL_ID
│   • VITE_COGNITO_CLIENT_ID
│   • VITE_COGNITO_IDENTITY_POOL_ID
│
├── package.json                       📦 Dependencies
│   • firebase: ^11.2.0
│   • @aws-amplify/core: ^6.7.1
│   • @aws-amplify/auth: ^6.7.1
│
├── vite.config.ts                     ⚙️  Vite configuration
│   • Port: 3002
│
└── README.md                          📚 Documentation


FLUJO DE DATOS:
═══════════════

User Action
    │
    ↓
┌─────────────────────┐
│   App.tsx (UI)      │  → Detecta click en botón
└─────────────────────┘
    │
    │ loginWithFirebase() o loginViaCognito()
    ↓
┌─────────────────────┐
│  AuthContext.tsx    │  → Maneja estado global
└─────────────────────┘
    │
    │ Llama método correspondiente
    ↓
┌─────────────────────┐
│  hybridAuth.ts      │  → Lógica de autenticación
└─────────────────────┘
    │
    ├─→ Firebase Direct
    │   └─→ firebaseConfig.ts
    │       └─→ signInWithPopup()
    │
    └─→ Via Cognito
        └─→ cognitoConfig.ts
            └─→ signInWithRedirect()
    
    ↓
User Authenticated
    │
    ↓
Update AuthContext State
    │
    ↓
Re-render App.tsx with user data
```

Este código está estructurado para ser:
✓ Modular y mantenible
✓ Type-safe con TypeScript
✓ Escalable para agregar más IdPs
✓ Fácil de testear
