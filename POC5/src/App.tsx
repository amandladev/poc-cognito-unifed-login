import { useState, useEffect } from 'react';
import './App.css';
import { loginWithOIDC, checkRedirectResult, logout } from './auth/authService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebaseConfig';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔄 Inicializando autenticación...');
        
        // Primero verificar si hay resultado de redirect
        const redirectUser = await checkRedirectResult();
        
        if (redirectUser) {
          console.log('✅ Usuario desde redirect:', redirectUser);
          setUser(redirectUser);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        // Luego escuchar cambios de autenticación
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          console.log('🔔 Auth state changed:', firebaseUser);
          
          if (firebaseUser) {
            setUser(firebaseUser);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('❌ Error en initAuth:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      console.log('🔐 Login clicked');
      await loginWithOIDC('oidc.cognito');
    } catch (error) {
      console.error('Error en login:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    } catch (error) {
      console.error('Error en logout:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="app">
        <div className="card">
          <div className="header">
            <h1>🔐 POC5 - Firebase Auth</h1>
            <span className="badge success">Autenticado</span>
          </div>

          <div className="user-info">
            <div className="avatar">
              {user.displayName?.charAt(0) || 'U'}
            </div>
            
            <h2>¡Bienvenido!</h2>

            <div className="info-grid">
              <div className="info-item">
                <span className="label">Nombre:</span>
                <span className="value">{user.displayName || 'N/A'}</span>
              </div>

              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{user.email || 'N/A'}</span>
              </div>

              <div className="info-item">
                <span className="label">UID:</span>
                <span className="value code">{user.uid || 'N/A'}</span>
              </div>

              {user.photoURL && (
                <div className="info-item">
                  <span className="label">Foto:</span>
                  <img src={user.photoURL} alt="Avatar" className="user-photo" />
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="btn btn-secondary">
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="card">
        <div className="header">
          <h1>🔐 POC5 - Firebase Auth</h1>
          <span className="badge">No autenticado</span>
        </div>

        <div className="login-container">
          <div className="welcome">
            <h2>Bienvenido</h2>
            <p>Inicia sesión para acceder a la aplicación</p>
          </div>

          <div className="login-options">
            <button onClick={handleLogin} className="btn btn-primary">
              🚀 Iniciar Sesión con Firebase
            </button>
          </div>

          <div className="info-box">
            <h3>📝 Para el desarrollador:</h3>
            <ul>
              <li>Configura Firebase en <code>src/config/firebaseConfig.ts</code></li>
              <li>Implementa la lógica de login en <code>handleLogin</code></li>
              <li>Implementa la lógica de logout en <code>handleLogout</code></li>
              <li>Actualiza el estado del usuario según Firebase Auth</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
