# Solución: Firebase Error (auth/unauthorized-domain)

## 🔧 Pasos para autorizar localhost:3002 en Firebase

### 1. Ve a Firebase Console
Abre: https://console.firebase.google.com/

### 2. Selecciona tu proyecto
- Proyecto: **semiotic-runner-473916-v5**

### 3. Ve a Authentication
1. En el menú lateral, haz click en **Authentication**
2. Luego en la pestaña **Sign-in method**

### 4. Configura dominios autorizados
1. Scroll down hasta **Authorized domains**
2. Click en **Add domain**
3. Agrega: `localhost`
4. Click en **Add**

### 5. Verifica que estén estos dominios:
- ✅ `localhost` (para desarrollo)
- ✅ `semiotic-runner-473916-v5.firebaseapp.com` (default)
- ✅ `semiotic-runner-473916-v5.web.app` (si usas hosting)

### 6. Reinicia la aplicación
```bash
# En tu terminal POC4
# Ctrl+C para detener
pnpm dev
```

---

## 📝 Comando Alternativo (Firebase CLI)

Si tienes Firebase CLI instalado:

```bash
firebase auth:domains:add localhost --project semiotic-runner-473916-v5
```

---

## 🎯 Después de agregar el dominio

1. Recarga la página en el navegador (http://localhost:3002)
2. Click en "Iniciar con Firebase"
3. Debería abrir el popup de Google Sign-In correctamente

---

## ⚠️ Nota Importante

Si planeas usar un dominio personalizado en producción, también deberás agregarlo a:
- Firebase Authorized Domains
- Google OAuth Client (Authorized Redirect URIs)
- Cognito App Client (Callback URLs)
