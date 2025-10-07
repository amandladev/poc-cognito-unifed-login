# POC5 - Firebase Authentication UI

Este proyecto contiene **solo la interfaz de usuario** lista para que conectes tu autenticación de Firebase.

## 🎨 Lo que está incluido

✅ **UI completa y responsive** con diseño moderno  
✅ **Estructura del proyecto** configurada con React + TypeScript + Vite  
✅ **Componentes preparados** para mostrar usuario autenticado  
✅ **Estilos profesionales** con gradientes y animaciones  
✅ **Archivos de configuración** listos para Firebase  

## 🚀 Instalación

```bash
cd POC5
pnpm install
pnpm dev
```

La aplicación estará disponible en: **http://localhost:3003**

## 📁 Estructura del Proyecto

```
POC5/
├── src/
│   ├── App.tsx              # Componente principal con UI
│   ├── App.css              # Estilos de la aplicación
│   ├── config/
│   │   └── firebaseConfig.ts    # ⚠️ CONFIGURA TUS CREDENCIALES AQUÍ
│   └── auth/
│       └── authService.ts       # Ejemplos de funciones de auth
├── package.json
├── vite.config.ts
└── README.md
```

## 🔧 Configuración de Firebase

### Paso 1: Obtener Credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Project Settings** (⚙️ → Project Settings)
4. En la sección **Your apps**, copia la configuración de tu web app
5. Si no tienes una web app, haz click en **Add app** → **Web** (</>) y sigue los pasos

### Paso 2: Configurar en el Proyecto

Abre `src/config/firebaseConfig.ts` y reemplaza con tus credenciales:

```typescript
export const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Paso 3: Inicializar Firebase

Descomenta el código en `firebaseConfig.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Paso 4: Instalar Dependencias de Firebase

```bash
pnpm add firebase
```

## 🔐 Implementar Autenticación

### Opción 1: Google Sign-In

En `src/App.tsx`, actualiza `handleLogin`:

```typescript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './config/firebaseConfig';

const handleLogin = async () => {
  setLoading(true);
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
    setIsAuthenticated(true);
  } catch (error) {
    console.error('Error en login:', error);
  } finally {
    setLoading(false);
  }
};
```

### Opción 2: OIDC Provider (ej: Cognito)

```typescript
import { signInWithRedirect, getRedirectResult, OAuthProvider } from 'firebase/auth';

const handleLogin = async () => {
  const provider = new OAuthProvider('oidc.tu-provider-id');
  provider.addScope('openid');
  provider.addScope('email');
  provider.addScope('profile');
  
  await signInWithRedirect(auth, provider);
};

// En useEffect para capturar el redirect:
useEffect(() => {
  const checkRedirect = async () => {
    const result = await getRedirectResult(auth);
    if (result) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
  };
  checkRedirect();
}, []);
```

### Implementar Logout

Actualiza `handleLogout`:

```typescript
import { signOut } from 'firebase/auth';

const handleLogout = async () => {
  setLoading(true);
  try {
    await signOut(auth);
    setUser(null);
    setIsAuthenticated(false);
  } catch (error) {
    console.error('Error en logout:', error);
  } finally {
    setLoading(false);
  }
};
```

### Escuchar Cambios de Autenticación

Agrega en `useEffect`:

```typescript
import { onAuthStateChanged } from 'firebase/auth';

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
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
}, []);
```

## 🎨 Personalización de UI

### Cambiar Colores del Gradiente

En `src/App.css`, modifica:

```css
.app {
  background: linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%);
}

.header {
  background: linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%);
}
```

### Modificar Textos

Edita directamente en `src/App.tsx`:
- Título: línea `<h1>🔐 POC5 - Firebase Auth</h1>`
- Mensajes de bienvenida
- Textos de botones

## 📚 Recursos

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Firebase Auth Providers](https://firebase.google.com/docs/auth/web/start)
- [OIDC with Firebase](https://firebase.google.com/docs/auth/web/openid-connect)

## ✅ Checklist de Implementación

- [ ] Instalar dependencias: `pnpm install`
- [ ] Instalar Firebase: `pnpm add firebase`
- [ ] Configurar credenciales en `firebaseConfig.ts`
- [ ] Inicializar Firebase (descomentar código)
- [ ] Implementar `handleLogin` con tu método preferido
- [ ] Implementar `handleLogout`
- [ ] Agregar `onAuthStateChanged` en useEffect
- [ ] Habilitar método de auth en Firebase Console
- [ ] Probar login y logout
- [ ] ¡Listo! 🎉

## 🐛 Troubleshooting

### Error: "auth/operation-not-allowed"
- Habilita el método de autenticación en Firebase Console → Authentication → Sign-in method

### Error: "auth/unauthorized-domain"
- Agrega tu dominio (ej: `localhost`) en Firebase Console → Authentication → Settings → Authorized domains

### El redirect no funciona
- Verifica que estés usando `getRedirectResult()` al cargar la app
- Asegúrate de que el callback URL esté configurado correctamente

---

**¡Tu UI está lista! Solo falta conectar Firebase y empezar a autenticar usuarios.** 🚀
