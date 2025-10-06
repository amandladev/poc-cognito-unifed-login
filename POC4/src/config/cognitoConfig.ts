// AWS Cognito Configuration
import { Amplify } from '@aws-amplify/core';

export const configureCognito = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-2_CpAkinT1i',
        userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '6bttup877q2dstrvu77r8v469q',
        identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || 'us-east-1:31e4f0a0-2e2c-47e9-8d20-8774ba50a770',
        loginWith: {
          oauth: {
            domain: 'us-east-2cpakint1i.auth.us-east-2.amazoncognito.com',
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: ['http://localhost:3002'],
            redirectSignOut: ['http://localhost:3002'],
            responseType: 'code',
            providers: ['Google']
          }
        }
      }
    }
  });
};
