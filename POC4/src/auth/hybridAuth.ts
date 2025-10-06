// Hybrid Authentication Module
// Supports both Firebase Direct and Firebase via Cognito flows

import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebaseConfig';
import { signInWithRedirect, signOut as cognitoSignOut, getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';

export type AuthMode = 'firebase-direct' | 'via-cognito';

export interface HybridAuthState {
  isAuthenticated: boolean;
  user: FirebaseUser | null;
  mode: AuthMode | null;
  loading: boolean;
  error: string | null;
}

export class HybridAuth {
  private mode: AuthMode | null = null;

  // Firebase Direct Login
  async signInWithFirebase(): Promise<FirebaseUser> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      this.mode = 'firebase-direct';
      return result.user;
    } catch (error: any) {
      console.error('Firebase login error:', error);
      throw new Error(error.message || 'Failed to sign in with Firebase');
    }
  }

  // Cognito Federated Login (via Google IdP)
  async signInViaCognito(): Promise<void> {
    try {
      this.mode = 'via-cognito';
      await signInWithRedirect({
        provider: {
          custom: 'Google'
        }
      });
    } catch (error: any) {
      console.error('Cognito login error:', error);
      throw new Error(error.message || 'Failed to sign in via Cognito');
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
    } catch (error) {
      console.error('Get Cognito user error:', error);
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
      if (this.mode === 'firebase-direct') {
        await firebaseSignOut(auth);
      } else if (this.mode === 'via-cognito') {
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
