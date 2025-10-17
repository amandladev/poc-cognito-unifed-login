import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Servicio para interactuar con Firebase Admin SDK
 * 
 * Este servicio permite:
 * 1. Crear custom tokens de Firebase
 * 2. Crear y actualizar usuarios en Firebase Auth
 * 3. Sincronizar información de usuarios entre Cognito y Firebase
 */
export class FirebaseService {
  private auth: admin.auth.Auth;
  private app: admin.app.App;

  constructor(serviceAccountPath: string) {
    try {
      // Resolver la ruta absoluta del archivo de credenciales
      const absolutePath = resolve(serviceAccountPath);
      console.log(`📁 Loading Firebase service account from: ${absolutePath}`);

      // Leer y parsear el archivo de credenciales
      const serviceAccount = JSON.parse(
        readFileSync(absolutePath, 'utf8')
      );

      // Inicializar Firebase Admin SDK
      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });

      this.auth = admin.auth();
      console.log(`✅ Firebase initialized for project: ${serviceAccount.project_id}`);
    } catch (error: any) {
      console.error('❌ Failed to initialize Firebase:', error.message);
      throw new Error(`Firebase initialization failed: ${error.message}`);
    }
  }

  /**
   * Crea un custom token de Firebase para el usuario
   * 
   * El custom token permite al cliente autenticarse en Firebase
   * sin necesidad de credenciales (email/password, OAuth, etc.)
   * 
   * Si el usuario no existe en Firebase, se crea automáticamente.
   * 
   * @param userId - ID único del usuario (generalmente el sub de Cognito)
   * @param additionalClaims - Claims adicionales a incluir en el token
   * @returns Custom token de Firebase (JWT)
   */
  async createCustomToken(
    userId: string,
    additionalClaims?: Record<string, any>
  ): Promise<string> {
    try {
      // Intentar obtener el usuario en Firebase
      await this.auth.getUser(userId);
      console.log(`📝 User ${userId} already exists in Firebase`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Si no existe, crear el usuario en Firebase
        try {
          await this.auth.createUser({
            uid: userId,
            // Extraer email de los claims si está disponible
            ...(additionalClaims?.email && { email: additionalClaims.email }),
            ...(additionalClaims?.emailVerified !== undefined && {
              emailVerified: additionalClaims.emailVerified
            })
          });
          console.log(`✅ Created new Firebase user: ${userId}`);
        } catch (createError: any) {
          // Si el error es que el email ya existe, buscar ese usuario y eliminarlo
          if (createError.code === 'auth/email-already-exists') {
            console.warn(`⚠️ Email already exists in Firebase. Attempting to find and delete old user...`);
            
            try {
              // Buscar usuario por email
              const existingUser = await this.auth.getUserByEmail(additionalClaims?.email);
              console.log(`🔍 Found existing user with different UID: ${existingUser.uid}`);
              
              // Eliminar el usuario viejo
              await this.auth.deleteUser(existingUser.uid);
              console.log(`🗑️ Deleted old Firebase user: ${existingUser.uid}`);
              
              // Intentar crear el nuevo usuario nuevamente
              await this.auth.createUser({
                uid: userId,
                ...(additionalClaims?.email && { email: additionalClaims.email }),
                ...(additionalClaims?.emailVerified !== undefined && {
                  emailVerified: additionalClaims.emailVerified
                })
              });
              console.log(`✅ Created new Firebase user after cleanup: ${userId}`);
            } catch (cleanupError: any) {
              console.error(`❌ Failed to cleanup and recreate user: ${cleanupError.message}`);
              throw cleanupError;
            }
          } else {
            console.error(`❌ Failed to create Firebase user: ${createError.message}`);
            throw createError;
          }
        }
      } else {
        // Error diferente a "usuario no encontrado"
        console.error(`❌ Error checking Firebase user: ${error.message}`);
        throw error;
      }
    }

    // Generar custom token
    // Los custom tokens expiran en 1 hora por defecto
    const customToken = await this.auth.createCustomToken(userId, additionalClaims);
    console.log(`🎫 Custom token created for user: ${userId}`);
    return customToken;
  }

  /**
   * Actualiza la información del usuario en Firebase
   * 
   * Útil para sincronizar cambios de Cognito a Firebase
   * 
   * @param userId - ID del usuario
   * @param userData - Datos a actualizar
   */
  async updateUser(
    userId: string,
    userData: {
      email?: string;
      displayName?: string;
      emailVerified?: boolean;
      photoURL?: string;
      disabled?: boolean;
    }
  ): Promise<void> {
    try {
      await this.auth.updateUser(userId, userData);
      console.log(`✅ Updated Firebase user: ${userId}`, userData);
    } catch (error: any) {
      console.error(`❌ Error updating Firebase user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene información del usuario de Firebase
   * 
   * @param userId - ID del usuario
   * @returns Registro del usuario de Firebase
   */
  async getUser(userId: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.auth.getUser(userId);
    } catch (error: any) {
      console.error(`❌ Error getting Firebase user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Elimina un usuario de Firebase
   * ⚠️ Usar con precaución
   * 
   * @param userId - ID del usuario a eliminar
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await this.auth.deleteUser(userId);
      console.log(`🗑️ Deleted Firebase user: ${userId}`);
    } catch (error: any) {
      console.error(`❌ Error deleting Firebase user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verifica un custom token (útil para testing)
   * 
   * @param token - Custom token a verificar
   * @returns Claims del token
   */
  async verifyCustomToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await this.auth.verifyIdToken(token);
    } catch (error: any) {
      console.error(`❌ Error verifying token: ${error.message}`);
      throw error;
    }
  }
}
