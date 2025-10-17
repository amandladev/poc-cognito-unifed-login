import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { signInWithRedirect, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { signInWithCustomToken, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { firebaseAuth } from '../config/firebaseConfig';
import { exchangeTokens, checkBackendHealth } from './bridgeService';

/**
 * Usuario unificado que combina información de Cognito y Firebase
 */
interface UnifiedUser {
  // Cognito data
  cognitoUserId: string;
  cognitoUsername: string;
  email?: string;
  emailVerified?: boolean;
  
  // Firebase data
  firebaseUid?: string;
  
  // Tokens
  cognitoIdToken?: string;
  cognitoAccessToken?: string;
}

/**
 * Context value con toda la funcionalidad de autenticación
 */
interface UnifiedAuthContextValue {
  user: UnifiedUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  backendHealthy: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  initialized: boolean;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextValue | undefined>(undefined);

/**
 * Provider que maneja la autenticación unificada Cognito + Firebase
 * 
 * Flujo:
 * 1. Usuario hace login en Cognito (Hosted UI)
 * 2. Obtiene tokens de Cognito
 * 3. Intercambia token de Cognito por custom token de Firebase
 * 4. Autentica en Firebase con el custom token
 * 5. Usuario queda autenticado en ambos sistemas
 */
export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Verificar salud del backend al montar
  useEffect(() => {
    checkBackendHealth().then(setBackendHealthy);
  }, []);

  // Listener para cambios en autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (fbUser) => {
      console.log('🔥 Firebase auth state changed:', fbUser?.uid);
      setFirebaseUser(fbUser);
    });

    return () => unsubscribe();
  }, []);

  // Inicialización: verificar si hay sesión activa en Cognito
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔍 Checking for existing Cognito session...');
        
        // Intentar obtener usuario actual de Cognito
        const cognitoUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        const idToken = session.tokens?.idToken?.toString();
        const accessToken = session.tokens?.accessToken?.toString();

        if (!idToken) {
          console.log('❌ No valid Cognito session found');
          setUser(null);
          setInitialized(true);
          setLoading(false);
          return;
        }

        console.log('✅ Cognito session found for:', cognitoUser.username);

        // Crear objeto de usuario con datos de Cognito
        const userData: UnifiedUser = {
          cognitoUserId: cognitoUser.userId,
          cognitoUsername: cognitoUser.username,
          email: (session.tokens as any)?.idToken?.payload?.email,
          emailVerified: (session.tokens as any)?.idToken?.payload?.email_verified,
          cognitoIdToken: idToken,
          cognitoAccessToken: accessToken,
        };

        setUser(userData);

        // Intentar autenticar en Firebase si el backend está disponible
        if (backendHealthy) {
          try {
            console.log('🔄 Attempting Firebase authentication...');
            const result = await exchangeTokens(idToken);

            if (result.success && result.firebaseToken) {
              // Autenticar en Firebase con el custom token
              await signInWithCustomToken(firebaseAuth, result.firebaseToken);
              console.log('✅ Firebase authentication successful');
              
              // Actualizar con el UID de Firebase
              setUser(prev => prev ? { ...prev, firebaseUid: result.user?.id } : null);
            }
          } catch (fbError: any) {
            console.error('❌ Firebase authentication failed:', fbError.message);
            setError(`Firebase authentication failed: ${fbError.message}`);
            // Nota: El usuario sigue autenticado en Cognito aunque falle Firebase
          }
        } else {
          console.warn('⚠️ Backend not healthy, skipping Firebase authentication');
          setError('Backend service is unavailable');
        }

      } catch (err: any) {
        console.log('ℹ️ No existing session:', err.message);
        setUser(null);
      } finally {
        setInitialized(true);
        setLoading(false);
      }
    };

    initAuth();
  }, [backendHealthy]);

  /**
   * Inicia sesión redirigiendo a Cognito Hosted UI
   */
  const login = useCallback(async () => {
    try {
      setError(null);
      console.log('🔐 Initiating login via Cognito...');
      await signInWithRedirect();
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Cierra sesión en ambos sistemas (Cognito y Firebase)
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚪 Logging out...');
      
      // Cerrar sesión en Firebase primero
      if (firebaseUser) {
        await firebaseAuth.signOut();
        console.log('✅ Firebase logout successful');
      }
      
      // Cerrar sesión en Cognito
      await signOut();
      console.log('✅ Cognito logout successful');
      
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      console.error('❌ Logout error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  const value: UnifiedAuthContextValue = {
    user,
    firebaseUser,
    loading,
    error,
    backendHealthy,
    login,
    logout,
    initialized,
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

/**
 * Hook para usar el contexto de autenticación unificada
 */
export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within UnifiedAuthProvider');
  }
  return context;
}
