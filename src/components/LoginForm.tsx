import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const styles = {
  form: {
    display: 'grid',
    gap: '1rem',
  } as React.CSSProperties,
  label: {
    display: 'grid',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#495057',
  } as React.CSSProperties,
  input: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '2px solid #e9ecef',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
    outline: 'none',
  } as React.CSSProperties,
  button: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  } as React.CSSProperties,
  error: {
    color: '#dc3545',
    background: '#f8d7da',
    border: '1px solid #f5c2c7',
    borderRadius: '8px',
    padding: '0.75rem',
    fontSize: '0.9rem',
  } as React.CSSProperties,
};

export const LoginForm: React.FC = () => {
  const { login, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <form onSubmit={onSubmit} style={styles.form}>
      <label style={styles.label}>
        <span>Email</span>
        <input
          name="username"
          type="email"
          autoComplete="username"
          autoFocus
          required
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={styles.input}
          onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
        />
      </label>
      <label style={styles.label}>
        <span>Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={styles.input}
          onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
        />
      </label>
      {error && <div style={styles.error}>⚠️ {error}</div>}
      <button 
        disabled={loading} 
        style={{
          ...styles.button,
          ...(loading ? styles.buttonDisabled : {})
        }}
        onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
        onFocus={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
        onBlur={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
      >
        {loading ? '🔄 Ingresando...' : '🚀 Ingresar'}
      </button>
    </form>
  );
};
