import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { signIn, signOut, getCurrentUser, fetchAuthSession, confirmSignIn } from 'aws-amplify/auth';
import { configureAmplify, ensureAmplifyConfigured, getConfiguredClientId } from '../amplifyConfig';
import { APP_CLIENTS, getDefaultClientId } from '../clientsConfig';

interface AuthUserInfo {
  username: string;
  userId: string;
  tokens?: {
    accessToken?: string;
    idToken?: string;
  };
}

type PendingChallenge =
  | { type: 'NEW_PASSWORD_REQUIRED'; username: string }
  | { type: 'MFA'; username: string; delivery?: string }
  | null;

interface AuthContextValue {
  user: AuthUserInfo | null;
  loading: boolean;
  error: string | null;
  pendingChallenge: PendingChallenge;
  currentClientId: string | null;
  availableClients: { key: string; clientId: string; label: string }[];
  login: (username: string, password: string) => Promise<void>;
  completeNewPassword: (newPassword: string) => Promise<void>;
  switchClient: (clientId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingChallenge, setPendingChallenge] = useState<PendingChallenge>(null);

  const [currentClientId, setCurrentClientId] = useState<string | null>(null);

  useEffect(() => {
    ensureAmplifyConfigured();
    const STORAGE_KEY = 'auth:selectedClientId';
    const stored = (typeof window !== 'undefined') ? window.localStorage.getItem(STORAGE_KEY) : null;
    const candidate = stored && APP_CLIENTS.find(c => c.clientId === stored) ? stored : null;
    const initial = candidate || getConfiguredClientId() || getDefaultClientId() || null;
    if (initial) {
      if (initial !== getConfiguredClientId()) {
        configureAmplify(initial);
      }
    } else if (stored) {
      // valor inválido
      try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
    }
    setCurrentClientId(initial);
    (async () => {
      try {
        // eslint-disable-next-line no-console
        console.debug('[Auth] Intentando recuperar sesión existente...');
        const cognitoUser = await getCurrentUser();
        const session = await fetchAuthSession();
        setUser({
          username: cognitoUser.username,
          userId: cognitoUser.userId,
          tokens: {
            accessToken: session.tokens?.accessToken?.toString(),
            idToken: session.tokens?.idToken?.toString()
          }
        });
      } catch {
        // eslint-disable-next-line no-console
        console.debug('[Auth] No hay sesión previa');
        setUser(null); // no logged user
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await signIn({ username, password });
      // eslint-disable-next-line no-console
      console.debug('[Auth] signIn nextStep:', res.nextStep);
      if (res.nextStep.signInStep === 'DONE') {
        const cognitoUser = await getCurrentUser();
        const session = await fetchAuthSession();
        setUser({
          username: cognitoUser.username,
          userId: cognitoUser.userId,
          tokens: {
            accessToken: session.tokens?.accessToken?.toString(),
            idToken: session.tokens?.idToken?.toString()
          }
        });
        setPendingChallenge(null);
      } else if (res.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setPendingChallenge({ type: 'NEW_PASSWORD_REQUIRED', username });
      } else if (res.nextStep.signInStep?.includes('MFA')) {
        setPendingChallenge({ type: 'MFA', username });
      } else {
        // Otros pasos se podrían manejar aquí.
        setPendingChallenge(null);
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.debug('[Auth] Error en login:', e);
      setError(e.message || 'Error al iniciar sesión');
      setUser(null);
      setPendingChallenge(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const completeNewPassword = useCallback(async (newPassword: string) => {
    if (!pendingChallenge || pendingChallenge.type !== 'NEW_PASSWORD_REQUIRED') return;
    setLoading(true);
    setError(null);
    try {
      await confirmSignIn({ challengeResponse: newPassword });
      // eslint-disable-next-line no-console
      console.debug('[Auth] Nueva contraseña establecida, obteniendo sesión');
      const cognitoUser = await getCurrentUser();
      const session = await fetchAuthSession();
      setUser({
        username: cognitoUser.username,
        userId: cognitoUser.userId,
        tokens: {
          accessToken: session.tokens?.accessToken?.toString(),
          idToken: session.tokens?.idToken?.toString()
        }
      });
      setPendingChallenge(null);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.debug('[Auth] Error completando nueva contraseña:', e);
      setError(e.message || 'No se pudo completar el desafío de nueva contraseña');
    } finally {
      setLoading(false);
    }
  }, [pendingChallenge]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const switchClient = useCallback(async (clientId: string) => {
    if (clientId === currentClientId) return;
    setLoading(true);
    setError(null);
    try {
      // cerrar sesión actual (ignorar errores)
      try { await signOut(); } catch {}
      setUser(null);
      setPendingChallenge(null);
      configureAmplify(clientId);
      setCurrentClientId(clientId);
      try { window.localStorage.setItem('auth:selectedClientId', clientId); } catch {}
      // No intenta auto-login; usuario debe autenticarse de nuevo con ese client.
    } catch (e: any) {
      setError(e.message || 'No se pudo cambiar de cliente');
    } finally {
      setLoading(false);
    }
  }, [currentClientId]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    error,
    pendingChallenge,
    currentClientId,
    availableClients: APP_CLIENTS,
    login,
    completeNewPassword,
    switchClient,
    logout
  }), [user, loading, error, pendingChallenge, currentClientId, login, completeNewPassword, switchClient, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
