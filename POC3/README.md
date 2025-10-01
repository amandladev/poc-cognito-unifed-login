# POC3 Hosted UI SSO

Mini segunda aplicación para validar SSO (Single Sign-On) usando el mismo User Pool y App Client Hosted UI.

## Variables (.env)

Copiar desde POC2 y ajustar el redirect al puerto 5175:
```
VITE_COGNITO_USER_POOL_ID=us-east-1_1Pn4bCUSW
VITE_COGNITO_HOSTED_CLIENT_ID=1unl341h0eatk2as48hdkugcvk
VITE_COGNITO_DOMAIN=poc-login-12345678.auth.us-east-1.amazoncognito.com
VITE_COGNITO_REDIRECT_SIGNIN=http://localhost:5175/
VITE_COGNITO_REDIRECT_SIGNOUT=http://localhost:5175/
VITE_COGNITO_SCOPES=openid email profile
```

Asegúrate que `http://localhost:5175/` está en las Callback y Logout URLs del App Client Hosted UI.

## Flujo
1. Inicia sesión primero en POC2 (puerto 5174).
2. Levanta POC3 y presiona Entrar.
3. Cognito debe redirigirte de vuelta inmediatamente (sin formulario) demostrando SSO.

## Sign Out Global
El botón "Cerrar sesión (global)" invoca `signOut()` del Hosted UI y elimina la cookie, forzando que la próxima app vuelva a pedir credenciales.
