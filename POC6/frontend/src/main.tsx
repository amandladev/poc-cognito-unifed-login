import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './ui/App';
import { UnifiedAuthProvider } from './auth/UnifiedAuthContext';
import { configureCognito } from './config/cognitoConfig';

// Configurar Cognito
configureCognito();

// Renderizar la aplicación
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UnifiedAuthProvider>
      <App />
    </UnifiedAuthProvider>
  </React.StrictMode>
);
