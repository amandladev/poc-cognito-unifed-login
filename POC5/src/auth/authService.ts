import { OAuthProvider, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export const loginWithOIDC = async (providerId: string) => {
  try {
    console.log('🚀 Iniciando login con OIDC...');
    console.log('📋 Provider ID:', providerId);
    console.log('🔐 Auth instance:', auth);
    
    const provider = new OAuthProvider(providerId);
    
    // Agregar scopes
    provider.addScope('openid');
    provider.addScope('email');
    provider.addScope('profile');
    provider.addScope('phone');
    
    console.log('✅ Provider configurado:', provider);
    console.log('🔄 Llamando a signInWithRedirect...');
    
    await signInWithRedirect(auth, provider);
    
    console.log('✅ signInWithRedirect completado (debería redirigir ahora)');
  } catch (error) {
    console.error('❌ Error en loginWithOIDC:', error);
    throw error;
  }
};

export const checkRedirectResult = async () => {
  try {
    console.log('🔍 Verificando resultado del redirect...');
    console.log('📍 URL actual:', window.location.href);
    console.log('📍 URL params:', window.location.search);
    
    const result = await getRedirectResult(auth);
    
    console.log('📦 Resultado completo:', result);
    
    if (result) {
      console.log('✅ Usuario autenticado desde redirect:', result.user);
      console.log('👤 Email:', result.user.email);
      console.log('👤 Display Name:', result.user.displayName);
      console.log('👤 UID:', result.user.uid);
      return result.user;
    } else {
      console.log('ℹ️ No hay resultado de redirect (normal en carga inicial)');
      return null;
    }
  } catch (error) {
    console.error('❌ Error al verificar redirect:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    console.log('🚪 Cerrando sesión...');
    await firebaseSignOut(auth);
    console.log('✅ Sesión cerrada');
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    throw error;
  }
};

/*

import { 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Ejemplo: Login con Google
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

// Ejemplo: Logout
export const logout = async () => {
  await firebaseSignOut(auth);
};

// Ejemplo: Escuchar cambios de autenticación
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
*/

export {};
