import { Request, Response } from 'express';
import { CognitoService } from '../services/cognitoService.js';
import { FirebaseService } from '../services/firebaseService.js';

/**
 * Controlador de autenticación
 * 
 * Maneja el flujo de intercambio de tokens entre Cognito y Firebase
 */
export class AuthController {
  constructor(
    private cognitoService: CognitoService,
    private firebaseService: FirebaseService
  ) {}

  /**
   * Endpoint principal: Intercambia token de Cognito por token de Firebase
   * 
   * POST /auth/exchange-token
   * Body: { cognitoToken: "eyJhbGc..." }
   * 
   * Flujo:
   * 1. Valida el token de Cognito
   * 2. Extrae información del usuario
   * 3. Crea/actualiza usuario en Firebase
   * 4. Genera custom token de Firebase
   * 5. Retorna el custom token y la info del usuario
   */
  exchangeToken = async (req: Request, res: Response) => {
    try {
      const { cognitoToken } = req.body;

      // Validar que el token esté presente
      if (!cognitoToken) {
        return res.status(400).json({
          success: false,
          error: 'Missing cognitoToken in request body'
        });
      }

      console.log('🔄 Starting token exchange...');

      // 1. Validar el token de Cognito
      console.log('1️⃣ Validating Cognito token...');
      const cognitoPayload = await this.cognitoService.validateToken(cognitoToken);
      const userInfo = this.cognitoService.extractUserInfo(cognitoPayload);

      console.log('✅ Token validated for user:', {
        userId: userInfo.userId,
        email: userInfo.email,
        username: userInfo.username
      });

      // 2. Preparar claims adicionales para Firebase
      const additionalClaims = {
        email: userInfo.email,
        emailVerified: userInfo.emailVerified,
        cognitoUsername: userInfo.username,
        ...(userInfo.groups && { cognitoGroups: userInfo.groups })
      };

      // 3. Generar custom token de Firebase
      console.log('2️⃣ Creating Firebase custom token...');
      const firebaseToken = await this.firebaseService.createCustomToken(
        userInfo.userId,
        additionalClaims
      );

      // 4. Actualizar información del usuario en Firebase
      if (userInfo.email) {
        console.log('3️⃣ Updating Firebase user info...');
        await this.firebaseService.updateUser(userInfo.userId, {
          email: userInfo.email,
          displayName: userInfo.username,
          emailVerified: userInfo.emailVerified
        });
      }

      console.log('✅ Token exchange completed successfully');

      // 5. Retornar el token de Firebase y la info del usuario
      return res.json({
        success: true,
        firebaseToken,
        user: {
          id: userInfo.userId,
          email: userInfo.email,
          username: userInfo.username,
          emailVerified: userInfo.emailVerified,
          groups: userInfo.groups
        }
      });

    } catch (error: any) {
      console.error('❌ Token exchange error:', error.message);
      
      // Determinar el código de estado apropiado
      let statusCode = 500;
      if (error.message.includes('validation failed') || 
          error.message.includes('invalid token') ||
          error.message.includes('expired')) {
        statusCode = 401;
      }

      return res.status(statusCode).json({
        success: false,
        error: 'Token exchange failed',
        message: error.message
      });
    }
  };

  /**
   * Endpoint de health check
   * 
   * GET /health
   * 
   * Útil para verificar que el servidor está funcionando
   */
  healthCheck = async (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'cognito-firebase-bridge',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  };

  /**
   * Endpoint para obtener información del usuario de Firebase
   * 
   * GET /auth/user/:userId
   * 
   * Útil para verificar que el usuario existe en Firebase
   */
  getUserInfo = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing userId parameter'
        });
      }

      const firebaseUser = await this.firebaseService.getUser(userId);

      return res.json({
        success: true,
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
          disabled: firebaseUser.disabled,
          metadata: {
            creationTime: firebaseUser.metadata.creationTime,
            lastSignInTime: firebaseUser.metadata.lastSignInTime
          }
        }
      });

    } catch (error: any) {
      console.error('❌ Error getting user info:', error.message);
      
      let statusCode = 500;
      if (error.code === 'auth/user-not-found') {
        statusCode = 404;
      }

      return res.status(statusCode).json({
        success: false,
        error: 'Failed to get user info',
        message: error.message
      });
    }
  };
}
