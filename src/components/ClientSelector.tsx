import React from 'react';
import { useAuth } from '../auth/AuthContext';

const styles = {
  container: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  } as React.CSSProperties,
  label: {
    fontSize: '0.85rem',
    color: '#6c757d',
    fontWeight: '600',
  } as React.CSSProperties,
  button: {
    padding: '0.4rem 0.9rem',
    borderRadius: '6px',
    border: '2px solid #667eea',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,
  buttonActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'default',
  } as React.CSSProperties,
  buttonInactive: {
    background: 'white',
    color: '#667eea',
  } as React.CSSProperties,
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as React.CSSProperties,
  lockedBadge: {
    fontSize: '0.7rem',
    background: '#fff3cd',
    color: '#664d03',
    padding: '0.25rem 0.6rem',
    borderRadius: '4px',
    border: '1px solid #ffecb5',
  } as React.CSSProperties,
};

export const ClientSelector: React.FC = () => {
  const { availableClients, currentClientId, switchClient, loading, user } = useAuth();
  if (!availableClients.length) return null;

  return (
    <div style={styles.container}>
      <span style={styles.label}>App Client:</span>
      {availableClients.map(c => {
        const active = c.clientId === currentClientId;
        const disabled = loading || active || !!user;
        return (
          <button
            key={c.clientId}
            disabled={disabled}
            onClick={() => switchClient(c.clientId)}
            style={{
              ...styles.button,
              ...(active ? styles.buttonActive : styles.buttonInactive),
              ...(disabled && !active ? styles.buttonDisabled : {})
            }}
            onMouseOver={(e) => {
              if (!disabled && !active) {
                e.currentTarget.style.background = '#667eea';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseOut={(e) => {
              if (!disabled && !active) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#667eea';
              }
            }}
            onFocus={(e) => {
              if (!disabled && !active) {
                e.currentTarget.style.background = '#667eea';
                e.currentTarget.style.color = 'white';
              }
            }}
            onBlur={(e) => {
              if (!disabled && !active) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#667eea';
              }
            }}
          >
            {c.label}
          </button>
        );
      })}
      {!!user && (
        <span style={styles.lockedBadge}>
          🔒 Bloqueado (cerrar sesión para cambiar)
        </span>
      )}
    </div>
  );
};
