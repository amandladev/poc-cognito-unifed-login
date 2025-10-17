/**
 * Cliente para comunicarse con el backend bridge
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface TokenExchangeResponse {
  success: boolean;
  firebaseToken?: string;
  user?: {
    id: string;
    email?: string;
    username: string;
    emailVerified?: boolean;
    groups?: string[];
  };
  error?: string;
  message?: string;
}

/**
 * Intercambia un token de Cognito por un custom token de Firebase
 * 
 * @param cognitoToken - ID Token de Cognito
 * @returns Token de Firebase y datos del usuario
 */
export async function exchangeTokens(cognitoToken: string): Promise<TokenExchangeResponse> {
  try {
    console.log('🔄 Exchanging Cognito token for Firebase token...');
    
    const response = await fetch(`${BACKEND_URL}/auth/exchange-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cognitoToken }),
    });

    const data: TokenExchangeResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Token exchange failed');
    }

    console.log('✅ Token exchange successful');
    return data;
  } catch (error: any) {
    console.error('❌ Token exchange error:', error.message);
    throw error;
  }
}

/**
 * Verifica que el backend esté disponible
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    return false;
  }
}
