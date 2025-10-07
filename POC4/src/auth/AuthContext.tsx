import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { hybridAuth, AuthMode } from './hybridAuth';
import { configureCognito } from '../config/cognitoConfig';

interface AuthContextType {
  isAuthenticated: boolean;
  user: FirebaseUser | null;
  cognitoUser: any;
  mode: AuthMode | null;
  loading: boolean;
  error: string | null;
  loginWithFirebase: () => Promise<void>;
  loginViaCognito: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [cognitoUser, setCognitoUser] = useState<any>(null);
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Configure Cognito
    configureCognito();

    const initAuth = async () => {
      try {
        // 1. Check for Firebase redirect result first (when returning from OAuth)
        const firebaseUser = await hybridAuth.checkRedirectResult();
        if (firebaseUser) {
          console.log('✅ Firebase user from redirect:', firebaseUser);
          setUser(firebaseUser);
          setMode('firebase-cognito-oidc');
          setLoading(false);
          return; // Don't check Cognito if Firebase user exists
        }

        // 2. Check for Cognito user only if no Firebase user
        const cognitoData = await hybridAuth.getCognitoUser();
        if (cognitoData) {
          console.log('✅ Cognito user found:', cognitoData);
          setCognitoUser(cognitoData);
          setMode('cognito-direct');
          setLoading(false);
          return;
        }

        // 3. No user found from either source
        setLoading(false);
      } catch (err: any) {
        console.error('Error initializing auth:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    // Listen to Firebase auth state changes
    const unsubscribe = hybridAuth.onFirebaseAuthStateChange((firebaseUser) => {
      console.log('🔄 Firebase auth state changed:', firebaseUser);
      
      if (firebaseUser) {
        console.log('✅ Firebase user detected in auth state listener');
        console.log('Email:', firebaseUser.email);
        console.log('UID:', firebaseUser.uid);
        console.log('Provider Data:', firebaseUser.providerData);
      }
      
      setUser(firebaseUser);
      if (firebaseUser) {
        setMode('firebase-cognito-oidc');
      }
    });

    initAuth();

    return () => unsubscribe();
  }, []);

  const loginWithFirebase = async () => {
    try {
      setLoading(true);
      setError(null);
      await hybridAuth.signInWithFirebase();
      // La función redireccionará, la app se recargará después
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loginViaCognito = async () => {
    try {
      setLoading(true);
      setError(null);
      await hybridAuth.signInViaCognito();
      // Redirect happens, state will be updated on return
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await hybridAuth.signOut();
      setUser(null);
      setCognitoUser(null);
      setMode(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!(user || cognitoUser);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        cognitoUser,
        mode,
        loading,
        error,
        loginWithFirebase,
        loginViaCognito,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
