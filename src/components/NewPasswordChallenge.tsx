import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const styles = {
  form: {
    display: 'grid',
    gap: '1rem',
  } as React.CSSProperties,
  heading: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.5rem',
    color: '#212529',
    fontWeight: '700',
  } as React.CSSProperties,
  description: {
    fontSize: '0.9rem',
    color: '#6c757d',
    margin: '0 0 1rem 0',
    lineHeight: '1.5',
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
  alert: {
    background: '#fff3cd',
    border: '1px solid #ffecb5',
    borderRadius: '8px',
    padding: '0.75rem',
    fontSize: '0.9rem',
    color: '#664d03',
    marginBottom: '1rem',
  } as React.CSSProperties,
};

export const NewPasswordChallenge: React.FC = () => {
  const { completeNewPassword, loading, error, pendingChallenge } = useAuth();
  const [pwd1, setPwd1] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!pendingChallenge || pendingChallenge.type !== 'NEW_PASSWORD_REQUIRED') return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (pwd1 !== pwd2) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }
    await completeNewPassword(pwd1);
  };

  return (
    <form onSubmit={onSubmit} style={styles.form}>
      <h2 style={styles.heading}>🔐 Establecer Nueva Contraseña</h2>
      <div style={styles.alert}>
        ⚠️ Tu usuario requiere cambiar la contraseña temporal antes de continuar.
      </div>
      <label style={styles.label}>
        <span>Nueva contraseña</span>
        <input 
          type="password" 
          required 
          value={pwd1} 
          onChange={e => setPwd1(e.target.value)} 
          autoFocus 
          style={styles.input}
          onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
        />
      </label>
      <label style={styles.label}>
        <span>Confirmar contraseña</span>
        <input 
          type="password" 
          required 
          value={pwd2} 
          onChange={e => setPwd2(e.target.value)} 
          style={styles.input}
          onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#e9ecef'}
        />
      </label>
      {(error || localError) && <div style={styles.error}>⚠️ {localError || error}</div>}
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
        {loading ? '⏳ Guardando...' : '✅ Guardar contraseña'}
      </button>
    </form>
  );
};
