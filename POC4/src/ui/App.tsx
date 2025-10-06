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
            <span className="badge">{mode === 'firebase-direct' ? 'Firebase Direct' : 'Via Cognito'}</span>
          </div>

          <div className="user-info">
            <h2>✅ Autenticado</h2>
            
            {mode === 'firebase-direct' && user && (
              <>
                <div className="info-row">
                  <span className="label">Modo:</span>
                  <span className="value">Firebase Authentication</span>
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
              </>
            )}

            {mode === 'via-cognito' && cognitoUser && (
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
              {mode === 'firebase-direct' 
                ? '🔹 Usuario → Firebase (Google) → JWT Token → Aplicación'
                : '🔹 Usuario → Google Sign-In → Cognito IdP (Google) → Cognito Pool Central → AWS Credentials → Aplicación'}
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
            <h3>🔥 Firebase Direct</h3>
            <p>Autenticación directa con Firebase usando Google Sign-In</p>
            <ul className="features">
              <li>✓ Sign-In con Google</li>
              <li>✓ JWT Token de Firebase</li>
              <li>✓ Sin pasar por Cognito</li>
            </ul>
            <button onClick={loginWithFirebase} className="btn btn-firebase">
              <span className="btn-icon">🔥</span>
              Iniciar con Firebase
            </button>
          </div>

          <div className="divider">O</div>

          <div className="option-card">
            <h3>☁️ Via Cognito (Federado)</h3>
            <p>Autenticación federada: Firebase → Cognito Pool Central</p>
            <ul className="features">
              <li>✓ Google como IdP en Cognito</li>
              <li>✓ Tokens de Cognito</li>
              <li>✓ AWS Credentials via Identity Pool</li>
            </ul>
            <button onClick={loginViaCognito} className="btn btn-cognito">
              <span className="btn-icon">☁️</span>
              Iniciar via Cognito
            </button>
          </div>
        </div>

        <div className="info-box">
          <h4>ℹ️ Sobre esta POC</h4>
          <p>
            Esta demostración muestra dos flujos de autenticación diferentes usando Google como proveedor de identidad:
          </p>
          <ol>
            <li><strong>Firebase Direct:</strong> Autenticación directa con Firebase/GCP</li>
            <li><strong>Via Cognito:</strong> Firebase/Google actúa como Identity Provider federado en Cognito</li>
          </ol>
          <p className="tech-note">
            💡 El segundo flujo permite obtener credenciales temporales de AWS para acceder a recursos de AWS.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
