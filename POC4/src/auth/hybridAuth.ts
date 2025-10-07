// Hybrid Authentication Module
// Firebase Auth UI validando contra Cognito Pool Central

import { 
  signInWithRedirect as firebaseSignInWithRedirect,
  getRedirectResult,
  OAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { signInWithRedirect, signOut as cognitoSignOut, getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';

export type AuthMode = 'firebase-cognito-oidc' | 'cognito-direct';

export interface HybridAuthState {
  isAuthenticated: boolean;
  user: FirebaseUser | null;
  mode: AuthMode | null;
  loading: boolean;
  error: string | null;
}

export class HybridAuth {
  private mode: AuthMode | null = null;

  // Firebase Auth UI validando contra Cognito (OIDC)
  async signInWithFirebase(): Promise<void> {
    try {
      // Crear provider OIDC apuntando a Cognito
      // El Provider ID debe coincidir con el configurado en Firebase Console
      const provider = new OAuthProvider('oidc.cognitonuevo');
      
      // Agregar parámetros custom para el flujo OIDC
      provider.addScope('openid');
      provider.addScope('email');
      provider.addScope('profile');
      provider.addScope('phone');
      
      // Configurar parámetros custom para OIDC
      provider.setCustomParameters({
        response_type: 'code',
        // Forzar que use el authorization code flow
      });
      
      console.log('🚀 Iniciando sign in con Firebase + Cognito OIDC...');
      console.log('Provider ID:', 'oidc.cognitonuevo');
      console.log('Scopes:', ['openid', 'email', 'profile', 'phone']);
      console.log('Response Type:', 'code');
      
      // Usar redirect en lugar de popup para flujos OIDC
      // El usuario será redireccionado a Cognito y luego de vuelta a la app
      this.mode = 'firebase-cognito-oidc';
      await firebaseSignInWithRedirect(auth, provider);
      
      // La función no retorna aquí - la app se recargará después del redirect
    } catch (error: any) {
      console.error('Firebase-Cognito OIDC login error:', error);
      throw new Error(error.message || 'Failed to sign in with Firebase-Cognito OIDC');
    }
  }

  // Verificar resultado del redirect cuando la app se recarga
  async checkRedirectResult(): Promise<FirebaseUser | null> {
    try {
      console.log('🔍 Checking redirect result...');
      console.log('📍 Current URL:', window.location.href);
      console.log('📍 URL params:', window.location.search);
      console.log('🔐 Auth instance:', auth);
      
      const result = await getRedirectResult(auth);
      console.log('📦 Redirect result:', result);
      
      if (result) {
        this.mode = 'firebase-cognito-oidc';
        console.log('✅ Firebase authentication successful (validated against Cognito)');
        console.log('Firebase User:', result.user);
        console.log('Provider Data:', result.user.providerData);
        console.log('Operation Type:', result.operationType);
        return result.user;
      }
      
      console.log('ℹ️ No redirect result found (normal on fresh page load)');
      return null;
    } catch (error: any) {
      console.error('❌ Firebase redirect result error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      throw new Error(error.message || 'Failed to process redirect result');
    }
  }

  // Cognito Hosted UI directo (sin Firebase)
  async signInViaCognito(): Promise<void> {
    try {
      this.mode = 'cognito-direct';
      await signInWithRedirect();
    } catch (error: any) {
      console.error('Cognito direct login error:', error);
      throw new Error(error.message || 'Failed to sign in via Cognito');
    }
  }

  // Get Firebase ID Token (puede usarse para intercambiar por AWS credentials)
  async getFirebaseIdToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      
      return await currentUser.getIdToken();
    } catch (error) {
      console.error('Get Firebase ID token error:', error);
      return null;
    }
  }

  // Get Current Cognito User
  async getCognitoUser() {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      return {
        user,
        tokens: session.tokens,
        credentials: session.credentials
      };
    } catch (error: any) {
      // Solo loguear si NO es un error de "no autenticado"
      if (error.name !== 'UserUnAuthenticatedException') {
        console.error('Get Cognito user error:', error);
      }
      return null;
    }
  }

  // Listen to Firebase Auth State
  onFirebaseAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Sign Out
  async signOut() {
    try {
      if (this.mode === 'firebase-cognito-oidc') {
        await firebaseSignOut(auth);
      } else if (this.mode === 'cognito-direct') {
        await cognitoSignOut();
      }
      this.mode = null;
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  getMode(): AuthMode | null {
    return this.mode;
  }
}

export const hybridAuth = new HybridAuth();
