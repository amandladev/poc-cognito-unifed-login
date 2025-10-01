# POC CDK Cognito

Este proyecto crea un User Pool de Cognito para probar:

- Flujo Hosted UI (Authorization Code + PKCE) con scopes `openid email profile`.
- Flujo directo de password (para la POC1) usando otro App Client.
- Múltiples callback/logout URLs para desarrollo local y despliegue.

## Estructura
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

