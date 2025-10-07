import { useAuth } from '../auth/AuthContext';
import './App.css';

function App() {
  const { isAuthenticated, user, cognitoUser, mode, loading, error, loginWithFirebase, loginViaCognito, logout } = useAuth();

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="app">
        <div className="card">
          <div className="header">
            <h1>🔐 POC4 - Autenticación Híbrida</h1>
            <span className="badge">{mode === 'firebase-cognito-oidc' ? 'Firebase + Cognito OIDC' : 'Cognito Direct'}</span>
          </div>

          <div className="user-info">
            <h2>✅ Autenticado</h2>
            
            {mode === 'firebase-cognito-oidc' && user && (
              <>
                <div className="info-row">
                  <span className="label">Modo:</span>
                  <span className="value">Firebase Auth (validado en Cognito via OIDC)</span>
                </div>
                <div className="info-row">
                  <span className="label">Nombre:</span>
                  <span className="value">{user.displayName || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{user.email || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Provider:</span>
                  <span className="value">{user.providerId}</span>
                </div>
                <div className="info-row">
                  <span className="label">UID:</span>
                  <span className="value code">{user.uid}</span>
                </div>
                <div className="info-row">
                  <span className="label">Validado por:</span>
                  <span className="value">Cognito Pool Central (us-east-2_CpAkinT1i)</span>
                </div>
              </>
            )}

            {mode === 'cognito-direct' && cognitoUser && (
              <>
                <div className="info-row">
                  <span className="label">Modo:</span>
                  <span className="value">AWS Cognito (Federated)</span>
                </div>
                <div className="info-row">
                  <span className="label">Username:</span>
                  <span className="value">{cognitoUser.user.username}</span>
                </div>
                <div className="info-row">
                  <span className="label">User ID:</span>
                  <span className="value code">{cognitoUser.user.userId}</span>
                </div>
                {cognitoUser.tokens && (
                  <>
                    <div className="info-row">
                      <span className="label">ID Token:</span>
                      <span className="value code">{cognitoUser.tokens.idToken?.toString().substring(0, 50)}...</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Access Token:</span>
                      <span className="value code">{cognitoUser.tokens.accessToken?.toString().substring(0, 50)}...</span>
                    </div>
                  </>
                )}
                {cognitoUser.credentials && (
                  <div className="info-row">
                    <span className="label">AWS Credentials:</span>
                    <span className="value">✅ Disponibles</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="architecture-info">
            <h3>📊 Arquitectura</h3>
            <p className="flow">
              {mode === 'firebase-cognito-oidc' 
                ? '🔹 Usuario → Firebase Auth UI → Cognito Pool Central (OIDC) → Firebase ID Token → Aplicación'
                : '🔹 Usuario → Cognito Hosted UI → Cognito Pool Central → AWS Credentials → Aplicación'}
            </p>
          </div>

          <button onClick={logout} className="btn btn-secondary">
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="card">
        <div className="header">
          <h1>🔐 POC4 - Autenticación Híbrida</h1>
          <p className="subtitle">Firebase + AWS Cognito</p>
        </div>

        {error && (
          <div className="error">
            ⚠️ {error}
          </div>
        )}

        <div className="login-options">
          <div className="option-card">
            <h3>🔥 Firebase + Cognito OIDC</h3>
            <p>Firebase Auth UI validando contra Cognito Pool Central</p>
            <ul className="features">
              <li>✓ UI de Firebase Authentication</li>
              <li>✓ Validación en Cognito via OIDC</li>
              <li>✓ Firebase ID Token</li>
            </ul>
            <button onClick={loginWithFirebase} className="btn btn-firebase">
              <span className="btn-icon">🔥</span>
              {' '}Iniciar con Firebase
            </button>
          </div>

          <div className="divider">O</div>

          <div className="option-card">
            <h3>☁️ Cognito Hosted UI</h3>
            <p>Autenticación directa con Cognito Hosted UI</p>
            <ul className="features">
              <li>✓ Hosted UI de Cognito</li>
              <li>✓ Tokens de Cognito</li>
              <li>✓ AWS Credentials via Identity Pool</li>
            </ul>
            <button onClick={loginViaCognito} className="btn btn-cognito">
              <span className="btn-icon">☁️</span>
              {' '}Iniciar con Cognito
            </button>
          </div>
        </div>

        <div className="info-box">
          <h4>ℹ️ Sobre esta POC</h4>
          <p>
            Esta demostración muestra dos flujos de autenticación usando AWS Cognito:
          </p>
          <ol>
            <li><strong>Firebase + Cognito OIDC:</strong> Firebase actúa como frontend, pero valida credenciales contra Cognito usando OIDC</li>
            <li><strong>Cognito Hosted UI:</strong> Autenticación directa con Cognito sin Firebase</li>
          </ol>
          <p className="tech-note">
            💡 El primer flujo combina la UI de Firebase con la seguridad y gestión de usuarios de Cognito.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
