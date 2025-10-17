import React from 'react';
import { useUnifiedAuth } from '../auth/UnifiedAuthContext';

/**
 * Componente principal de la aplicación
 * Muestra el estado de autenticación en Cognito y Firebase
 */
export const App: React.FC = () => {
  const { user, firebaseUser, loading, error, backendHealthy, login, logout, initialized } = useUnifiedAuth();

  // Función auxiliar para truncar tokens largos
  const truncateToken = (token?: string) => {
    if (!token) return 'N/A';
    return `${token.substring(0, 20)}...${token.substring(token.length - 20)}`;
  };

  if (!initialized || loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1>🔄 Loading...</h1>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1>🔐 POC6: Cognito + Firebase Login</h1>
          <p style={styles.subtitle}>Login unificado con autenticación centralizada</p>
          
          {!backendHealthy && (
            <div style={styles.warning}>
              ⚠️ Backend no disponible. Verifica que esté ejecutándose en http://localhost:3001
            </div>
          )}
          
          {error && (
            <div style={styles.error}>
              ❌ Error: {error}
            </div>
          )}
          
          <button onClick={login} style={styles.button}>
            Login with Cognito
          </button>
          
          <div style={styles.info}>
            <h3>ℹ️ Cómo funciona:</h3>
            <ol style={styles.list}>
              <li>Click en "Login with Cognito"</li>
              <li>Serás redirigido a AWS Cognito para autenticarte</li>
              <li>Después del login, el token de Cognito se intercambia por uno de Firebase</li>
              <li>Quedarás autenticado en ambos sistemas simultáneamente</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>✅ Autenticación Exitosa</h1>
        
        <div style={styles.section}>
          <h2>👤 Información del Usuario</h2>
          <div style={styles.infoGrid}>
            <div>
              <strong>Email:</strong>
              <div>{user.email || 'N/A'}</div>
            </div>
            <div>
              <strong>Username:</strong>
              <div>{user.cognitoUsername}</div>
            </div>
            <div>
              <strong>Email Verified:</strong>
              <div>{user.emailVerified ? '✅ Yes' : '❌ No'}</div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2>🔐 AWS Cognito</h2>
          <div style={styles.infoGrid}>
            <div>
              <strong>User ID:</strong>
              <div style={styles.mono}>{user.cognitoUserId}</div>
            </div>
            <div>
              <strong>ID Token:</strong>
              <div style={styles.mono}>{truncateToken(user.cognitoIdToken)}</div>
            </div>
            <div>
              <strong>Status:</strong>
              <div>✅ Authenticated</div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2>🔥 Firebase</h2>
          {firebaseUser ? (
            <div style={styles.infoGrid}>
              <div>
                <strong>User ID (UID):</strong>
                <div style={styles.mono}>{firebaseUser.uid}</div>
              </div>
              <div>
                <strong>Email:</strong>
                <div>{firebaseUser.email || 'N/A'}</div>
              </div>
              <div>
                <strong>Status:</strong>
                <div>✅ Authenticated</div>
              </div>
              <div>
                <strong>Provider:</strong>
                <div>Custom Token (from Cognito)</div>
              </div>
            </div>
          ) : (
            <div style={styles.warning}>
              ⚠️ No autenticado en Firebase
              {!backendHealthy && ' (Backend no disponible)'}
            </div>
          )}
        </div>

        {error && (
          <div style={styles.error}>
            ❌ {error}
          </div>
        )}

        <div style={styles.actions}>
          <button onClick={logout} style={styles.buttonSecondary}>
            Logout
          </button>
        </div>

        <div style={styles.footer}>
          <h3>🎯 Próximos pasos:</h3>
          <ul style={styles.list}>
            <li>Puedes usar los servicios de AWS con las credenciales de Cognito</li>
            <li>Puedes usar Firebase Realtime Database, Firestore, Storage, etc.</li>
            <li>El usuario está sincronizado en ambos sistemas</li>
            <li>Abre la consola del navegador para ver logs detallados</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Estilos en línea para simplicidad
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  subtitle: {
    color: '#666',
    marginTop: '-10px',
    marginBottom: '30px',
  },
  section: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  infoGrid: {
    display: 'grid',
    gap: '15px',
    marginTop: '10px',
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#666',
    wordBreak: 'break-all',
  },
  button: {
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    marginTop: '20px',
  },
  buttonSecondary: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  actions: {
    marginTop: '30px',
  },
  warning: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '12px',
    borderRadius: '6px',
    marginTop: '15px',
    border: '1px solid #ffeaa7',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '6px',
    marginTop: '15px',
    border: '1px solid #f5c6cb',
  },
  info: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#e7f3ff',
    borderRadius: '8px',
  },
  footer: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
  },
  list: {
    textAlign: 'left',
    lineHeight: '1.8',
    color: '#444',
  },
};
