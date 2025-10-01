import { Amplify } from 'aws-amplify';

export interface HostedUIConfigEnv {
  userPoolId: string;
  userPoolClientId: string;
  domain: string; // dominio configurado en Cognito (sin protocolo)
  region?: string;
  redirectSignIn: string[]; // lista de callbacks permitidos
  redirectSignOut: string[]; // lista de signout urls permitidos
  scopes: string[];
  identityPoolId: string;
}

export function configureHostedUI(cfg: HostedUIConfigEnv) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: cfg.userPoolId,
        userPoolClientId: cfg.userPoolClientId,
        identityPoolId: cfg.identityPoolId,
        // En Amplify JS v6 la configuración OAuth para Hosted UI va dentro de loginWith.oauth
        // Referencia: https://docs.amplify.aws/javascript/build-a-backend/auth/set-up-auth/
        loginWith: {
          oauth: {
            domain: cfg.domain, // sin protocolo
            scopes: cfg.scopes,
            redirectSignIn: cfg.redirectSignIn,
            redirectSignOut: cfg.redirectSignOut,
            responseType: 'code'
          }
        }
      },
    }
  });
}

export function loadEnvConfig(): HostedUIConfigEnv {
  const env = import.meta.env;
  const userPoolId = env.VITE_COGNITO_USER_POOL_ID;
  const userPoolClientId = env.VITE_COGNITO_HOSTED_CLIENT_ID;
  const domain = env.VITE_COGNITO_DOMAIN; // ej: mydomain.auth.us-east-1.amazoncognito.com
  const redirectSignIn = (env.VITE_COGNITO_REDIRECT_SIGNIN || '').split(',').map(s => s.trim()).filter(Boolean);
  let redirectSignOut = (env.VITE_COGNITO_REDIRECT_SIGNOUT || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!redirectSignOut.length) {
    // Fallback: reutilizar las mismas que signIn
    redirectSignOut = [...redirectSignIn];
  }
  const scopesRaw = env.VITE_COGNITO_SCOPES || 'openid email profile';
  const identityPoolId = env.VITE_COGNITO_IDENTITY_POOL_ID;
  return {
    userPoolId,
    userPoolClientId,
    domain,
    redirectSignIn,
    redirectSignOut,
    scopes: scopesRaw.split(/\s+/),
    identityPoolId
  };
}
