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

    // Listen to Firebase auth state
    const unsubscribe = hybridAuth.onFirebaseAuthStateChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Check for Cognito user on mount
    checkCognitoUser();

    return () => unsubscribe();
  }, []);

  const checkCognitoUser = async () => {
    const cognitoData = await hybridAuth.getCognitoUser();
    if (cognitoData) {
      setCognitoUser(cognitoData);
      setMode('via-cognito');
    }
    setLoading(false);
  };

  const loginWithFirebase = async () => {
    try {
      setLoading(true);
      setError(null);
      const firebaseUser = await hybridAuth.signInWithFirebase();
      setUser(firebaseUser);
      setMode('firebase-direct');
    } catch (err: any) {
      setError(err.message);
    } finally {
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
