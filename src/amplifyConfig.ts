import { Amplify } from 'aws-amplify';
import { getDefaultClientId } from './clientsConfig';

let configuredClientId: string | null = null;

function deriveRegionFromUserPoolId(userPoolId: string): string | undefined {
  // Formato típico: us-east-1_XXXXXXX
  const re = /^([a-z0-9-]+)_/i;
  const exec = re.exec(userPoolId);
  return exec?.[1];
}

// Función para inicializar Amplify solo una vez.
export function configureAmplify(clientId?: string) {
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const userPoolClientId = clientId || getDefaultClientId();
  const explicitRegion = import.meta.env.VITE_AWS_REGION;
  const derivedRegion = deriveRegionFromUserPoolId(userPoolId);
  const region = explicitRegion || derivedRegion;

  if (!region) {
    // eslint-disable-next-line no-console
    console.warn('[AmplifyConfig] No se pudo determinar la región; especifica VITE_AWS_REGION.');
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId: userPoolClientId as string
      }
    }
  });
  configuredClientId = userPoolClientId || null;
  // eslint-disable-next-line no-console
  console.debug('[AmplifyConfig] Configurado clientId:', configuredClientId, 'region:', region);
}

export function getConfiguredClientId() {
  return configuredClientId;
}

export function ensureAmplifyConfigured() {
  if (!configuredClientId) configureAmplify();
}
