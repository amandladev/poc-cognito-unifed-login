import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { signInWithRedirect, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { configureHostedUI, loadEnvConfig } from './authConfig';

interface HostedUser {
  username: string;
  userId: string;
  email?: string;
  idToken?: string;
  accessToken?: string;
  aud?: string;
  exp?: number;
}

interface HostedAuthContextValue {
  user: HostedUser | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  initialized: boolean;
}

const HostedAuthContext = createContext<HostedAuthContextValue | undefined>(undefined);

export const HostedAuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<HostedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const cfg = loadEnvConfig();
    configureHostedUI(cfg);
    (async () => {
      try {
        const cognitoUser = await getCurrentUser();
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        const accessToken = session.tokens?.accessToken?.toString();
        let aud: string | undefined;
        let exp: number | undefined;
        try {
          if (idToken) {
            const payload = JSON.parse(atob(idToken.split('.')[1]));
            aud = payload.aud; exp = payload.exp;
          }
        } catch {}
        console.log('Cognito User:', cognitoUser);
        console.log('Session:', session);
        setUser({
          username: cognitoUser.username,
          userId: cognitoUser.userId,
            email: (session.tokens as any)?.idToken?.payload?.email,
          idToken,
          accessToken,
          aud,
          exp
        });
      } catch {
        setUser(null);
      } finally {
        setInitialized(true);
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async () => {
    setError(null);
    await signInWithRedirect();
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<HostedAuthContextValue>(() => ({ user, loading, error, login, logout, initialized }), [user, loading, error, login, logout, initialized]);
  return <HostedAuthContext.Provider value={value}>{children}</HostedAuthContext.Provider>;
};

export function useHostedAuth() {
  const ctx = useContext(HostedAuthContext);
  if (!ctx) throw new Error('useHostedAuth debe usarse dentro de HostedAuthProvider');
  return ctx;
}
