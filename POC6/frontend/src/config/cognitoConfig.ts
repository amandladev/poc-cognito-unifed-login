import { Amplify } from 'aws-amplify';

/**
 * Configuración de AWS Cognito con Amplify
 */
export function configureCognito() {
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const domain = import.meta.env.VITE_COGNITO_DOMAIN;
  const redirectSignIn = import.meta.env.VITE_COGNITO_REDIRECT_SIGNIN;
  const redirectSignOut = import.meta.env.VITE_COGNITO_REDIRECT_SIGNOUT;
  const scopes = (import.meta.env.VITE_COGNITO_SCOPES || 'openid email profile').split(' ');

  if (!userPoolId || !clientId || !domain) {
    throw new Error('Missing required Cognito configuration in environment variables');
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId: clientId,
        loginWith: {
          oauth: {
            domain,
            scopes,
            redirectSignIn: [redirectSignIn],
            redirectSignOut: [redirectSignOut],
            responseType: 'code',
          }
        }
      }
    }
  });

  console.log('✅ Cognito configured');
}
