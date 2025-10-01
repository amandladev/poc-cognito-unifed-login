# POC2 - Hosted UI (Cognito Authorization Code + PKCE)

Demostración de autenticación con el Hosted UI de Amazon Cognito para habilitar SSO entre múltiples aplicaciones/domínios.

## Flujo
1. Usuario hace clic en "Iniciar sesión".
2. Redirección al dominio de Cognito (Hosted UI).
3. Cognito autentica (o detecta cookie existente y omite credenciales).
4. Redirige de vuelta con `?code=`.
5. La app intercambia el code por tokens (ID / Access / Refresh) vía Amplify.
6. Sesión local establecida; se puede repetir en otra app y obtendrá SSO.

## Variables necesarias (.env)
Ver `.env.example`:
```
VITE_COGNITO_USER_POOL_ID=...
VITE_COGNITO_HOSTED_CLIENT_ID=...
VITE_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
VITE_COGNITO_REDIRECT_SIGNIN=http://localhost:5174/
VITE_COGNITO_REDIRECT_SIGNOUT=http://localhost:5174/
VITE_COGNITO_SCOPES="openid email profile"
```

## Ejecutar (usa dependencias raíz)
```bash
pnpm --filter poc2-hosted-ui dev --port 5174
```

## Diferencias con POC1
| POC | Método | SSO Cross-domain | Federación futura | Password embedding |
|-----|--------|------------------|-------------------|--------------------|
| 1   | API directa (username/password) | No | Manual | Sí (en UI) |
| 2   | Hosted UI OAuth2 Code PKCE | Sí (cookie Cognito) | Integrada | No |

## Próximos pasos
- Añadir soporte de federación (Azure AD / Google) en el User Pool.
- Manejar refresh token (renovar antes de expirar access token).
- Global sign-out across apps.
- `prompt=login` y `prompt=none` según escenarios.
- Control de scopes avanzados / APIs protegidas.

## Seguridad
- Usa siempre HTTPS en producción.
- Verifica configuración de redirect URIs exactas en Cognito.
- Minimiza scopes.

## Nota
Esta POC no mezcla el flujo antiguo con el Hosted UI para mantener claridad. Puedes reutilizar conceptos en producción y migrar gradualmente.
