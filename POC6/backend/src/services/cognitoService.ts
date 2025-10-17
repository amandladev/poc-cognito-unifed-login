import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';

/**
 * Payload del token de Cognito ID Token
 */
export interface CognitoTokenPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
  'cognito:username': string;
  'cognito:groups'?: string[];
  aud: string;
  token_use: string;
  exp: number;
  iat: number;
  iss: string;
}

/**
 * Información extraída del usuario
 */
export interface UserInfo {
  userId: string;
  email?: string;
  username: string;
  emailVerified?: boolean;
  groups?: string[];
}

/**
 * Servicio para validar tokens de AWS Cognito
 * 
 * Este servicio verifica la autenticidad de los tokens JWT emitidos por Cognito
 * utilizando las claves públicas del User Pool (JWKS).
 */
export class CognitoService {
  private client: jwksClient.JwksClient;
  private userPoolId: string;
  private clientId: string;
  private region: string;
  private issuer: string;

  constructor(region: string, userPoolId: string, clientId: string) {
    this.region = region;
    this.userPoolId = userPoolId;
    this.clientId = clientId;
    this.issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

    // Cliente JWKS para obtener las claves públicas de Cognito
    // Cognito usa RS256 (RSA con SHA-256) para firmar los tokens
    this.client = jwksClient({
      jwksUri: `${this.issuer}/.well-known/jwks.json`,
      cache: true,
      cacheMaxAge: 600000, // 10 minutos
      rateLimit: true,
      jwksRequestsPerMinute: 10
    });

    console.log(`✅ CognitoService initialized for pool: ${userPoolId}`);
  }

  /**
   * Obtiene la clave pública para verificar el token
   * Esta función es usada por jwt.verify para obtener la clave correcta
   */
  private getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
    this.client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        console.error('Error getting signing key:', err);
        callback(err);
        return;
      }
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    });
  };

  /**
   * Valida el token de Cognito
   * 
   * Verifica:
   * 1. Firma del token usando la clave pública de Cognito
   * 2. Que no esté expirado
   * 3. Que el audience (aud) coincida con el client ID
   * 4. Que el issuer sea el User Pool correcto
   * 5. Que sea un ID token (no access token)
   * 
   * @param token - El ID token de Cognito en formato JWT
   * @returns Payload del token validado
   * @throws Error si el token es inválido
   */
  async validateToken(token: string): Promise<CognitoTokenPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        this.getKey,
        {
          algorithms: ['RS256'],
          audience: this.clientId,
          issuer: this.issuer
        },
        (err, decoded) => {
          if (err) {
            console.error('Token validation failed:', err.message);
            reject(new Error(`Token validation failed: ${err.message}`));
            return;
          }

          const payload = decoded as CognitoTokenPayload;

          // Validación adicional: debe ser un ID token
          if (payload.token_use !== 'id') {
            reject(new Error('Token must be an ID token (token_use: id)'));
            return;
          }

          console.log(`✅ Token validated for user: ${payload.sub}`);
          resolve(payload);
        }
      );
    });
  }

  /**
   * Extrae información relevante del usuario del token validado
   * 
   * @param payload - Payload del token validado
   * @returns Información del usuario en formato simplificado
   */
  extractUserInfo(payload: CognitoTokenPayload): UserInfo {
    return {
      userId: payload.sub,
      email: payload.email,
      username: payload['cognito:username'],
      emailVerified: payload.email_verified,
      groups: payload['cognito:groups']
    };
  }

  /**
   * Decodifica un token sin validarlo (solo para debugging)
   * ⚠️ NO usar en producción para tomar decisiones de autorización
   */
  decodeTokenUnsafe(token: string): any {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      return null;
    }
  }
}
