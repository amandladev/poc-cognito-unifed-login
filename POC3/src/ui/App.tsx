import React from 'react';
import { HostedAuthProvider, useHostedAuth } from '../auth/HostedAuthContext';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  } as React.CSSProperties,
  card: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '2.5rem',
    maxWidth: '500px',
    width: '100%',
  } as React.CSSProperties,
  header: {
    margin: '0 0 1.5rem 0',
    fontSize: '2rem',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '700',
  } as React.CSSProperties,
  badge: {
    display: 'inline-block',
    background: '#fff0f6',
    color: '#f5576c',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '1rem',
  } as React.CSSProperties,
  button: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
    marginTop: '1rem',
  } as React.CSSProperties,
  buttonSecondary: {
    background: '#fff',
    color: '#f5576c',
    border: '2px solid #f5576c',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
    marginTop: '1rem',
  } as React.CSSProperties,
  userInfoCard: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '1rem',
  } as React.CSSProperties,
  userField: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid #e9ecef',
  } as React.CSSProperties,
  label: {
    color: '#6c757d',
    fontWeight: '600',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  value: {
    color: '#212529',
    fontWeight: '500',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  details: {
    marginTop: '1rem',
    background: '#fff',
    borderRadius: '8px',
    padding: '1rem',
    border: '1px solid #e9ecef',
  } as React.CSSProperties,
  summary: {
    cursor: 'pointer',
    fontWeight: '600',
    color: '#f5576c',
    userSelect: 'none',
  } as React.CSSProperties,
  code: {
    display: 'block',
    marginTop: '0.5rem',
    padding: '0.75rem',
    background: '#f8f9fa',
    borderRadius: '6px',
    fontSize: '0.7rem',
    wordBreak: 'break-all',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    color: '#495057',
    lineHeight: '1.5',
  } as React.CSSProperties,
  description: {
    color: '#6c757d',
    fontSize: '1rem',
    lineHeight: '1.6',
    margin: '0 0 1rem 0',
  } as React.CSSProperties,
  loader: {
    textAlign: 'center',
    color: '#f5576c',
    fontSize: '1.1rem',
  } as React.CSSProperties,
  ssoIndicator: {
    background: '#d1f4e0',
    border: '1px solid #9ae6b4',
    borderRadius: '8px',
    padding: '1rem',
    marginTop: '1rem',
    fontSize: '0.9rem',
    color: '#2f855a',
    lineHeight: '1.5',
  } as React.CSSProperties,
};

const UserInfo: React.FC = () => {
  const { user, logout } = useHostedAuth();
  if (!user) return null;
  return (
    <>
      <span style={styles.badge}>✅ SSO Activado - Autenticado</span>
      <div style={styles.ssoIndicator}>
        🎉 <strong>SSO Exitoso!</strong> Has accedido sin volver a ingresar credenciales gracias a la cookie de sesión compartida de Cognito.
      </div>
      <div style={styles.userInfoCard}>
        <div style={styles.userField}>
          <span style={styles.label}>Usuario</span>
          <span style={styles.value}>{user.username}</span>
        </div>
        {user.email && (
          <div style={styles.userField}>
            <span style={styles.label}>Email</span>
            <span style={styles.value}>{user.email}</span>
          </div>
        )}
        {user.aud && (
          <div style={styles.userField}>
            <span style={styles.label}>Audience</span>
            <span style={styles.value}>{user.aud}</span>
          </div>
        )}
        {user.exp && (
          <div style={{...styles.userField, borderBottom: 'none'}}>
            <span style={styles.label}>Expira</span>
            <span style={styles.value}>{new Date(user.exp * 1000).toLocaleString()}</span>
          </div>
        )}
      </div>
      <details style={styles.details}>
        <summary style={styles.summary}>🔑 Ver ID Token</summary>
        <code style={styles.code}>{user.idToken?.slice(0,250)}...</code>
      </details>
      <button 
        style={styles.buttonSecondary}
        onClick={logout}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#f5576c';
          e.currentTarget.style.color = 'white';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.color = '#f5576c';
        }}
        onFocus={(e) => {
          e.currentTarget.style.background = '#f5576c';
          e.currentTarget.style.color = 'white';
        }}
        onBlur={(e) => {
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.color = '#f5576c';
        }}
      >
        Cerrar sesión (global)
      </button>
    </>
  );
};

const Landing: React.FC = () => {
  const { login, loading, initialized, user } = useHostedAuth();
  
  if (!initialized) {
    return <div style={styles.loader}>⚙️ Cargando configuración...</div>;
  }
  
  if (loading && !user) {
    return <div style={styles.loader}>🔄 Buscando sesión SSO...</div>;
  }
  
  if (user) return <UserInfo />;
  
  return (
    <>
      <span style={styles.badge}>🔗 POC3: SSO Demo</span>
      <p style={styles.description}>
        Esta es una segunda aplicación para validar <strong>Single Sign-On (SSO)</strong>. Si ya iniciaste sesión en POC2, serás autenticado automáticamente sin reingresar credenciales.
      </p>
      <div style={{...styles.ssoIndicator, background: '#fff3cd', border: '1px solid #ffecb5', color: '#664d03'}}>
        💡 <strong>Tip:</strong> Si ya iniciaste sesión en POC2 (puerto 5174), el inicio de sesión aquí será <strong>instantáneo</strong> gracias a la cookie compartida de Cognito.
      </div>
      <button 
        style={styles.button}
        onClick={login}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 87, 108, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        onFocus={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 87, 108, 0.4)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        🚀 Entrar con Hosted UI
      </button>
    </>
  );
};

export const App: React.FC = () => (
  <HostedAuthProvider>
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.header}>Amazon Cognito SSO</h1>
        <Landing />
      </div>
    </div>
  </HostedAuthProvider>
);
