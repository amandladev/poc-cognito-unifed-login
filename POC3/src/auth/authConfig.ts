import { Amplify } from 'aws-amplify';

export interface HostedUIConfigEnv {
  userPoolId: string;
  userPoolClientId: string;
  domain: string;
  redirectSignIn: string[];
  redirectSignOut: string[];
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
        loginWith: {
          oauth: {
            domain: cfg.domain,
            scopes: cfg.scopes,
            redirectSignIn: cfg.redirectSignIn,
            redirectSignOut: cfg.redirectSignOut,
            responseType: 'code',
          }
        }
      }
    }
  });
}

export function loadEnvConfig(): HostedUIConfigEnv {
  const env = import.meta.env as Record<string, string>;
  const userPoolId = env.VITE_COGNITO_USER_POOL_ID;
  const userPoolClientId = env.VITE_COGNITO_HOSTED_CLIENT_ID;
  const domain = env.VITE_COGNITO_DOMAIN;
  const redirectSignIn = (env.VITE_COGNITO_REDIRECT_SIGNIN || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  let redirectSignOut = (env.VITE_COGNITO_REDIRECT_SIGNOUT || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  if (!redirectSignOut.length) redirectSignOut = [...redirectSignIn];
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
