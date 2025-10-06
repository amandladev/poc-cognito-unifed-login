# Configurar Firebase desde Cloud Shell

## 🚀 Pasos para autorizar localhost desde Cloud Shell

### 1. Abrir Cloud Shell
Ve a: https://console.cloud.google.com/
Click en el icono de Cloud Shell (>_) en la parte superior derecha

### 2. Instalar Firebase CLI (si no está instalado)
```bash
curl -sL https://firebase.tools | bash
```

### 3. Autenticarse en Firebase
```bash
firebase login --no-localhost
```
Sigue el link que te muestra, autoriza y pega el código de autenticación.

### 4. Seleccionar el proyecto
```bash
firebase use semiotic-runner-473916-v5
```

### 5. Listar dominios autorizados actuales
```bash
firebase auth:domains:list
```

### 6. Agregar localhost como dominio autorizado
```bash
firebase auth:domains:add localhost
```

### 7. Verificar que se agregó correctamente
```bash
firebase auth:domains:list
```

Deberías ver:
```
✔ Authorized domains for semiotic-runner-473916-v5:
  - localhost
  - semiotic-runner-473916-v5.firebaseapp.com
  - semiotic-runner-473916-v5.web.app
```

---

## 🎯 Comandos en una sola línea (Copy & Paste)

Si Firebase CLI ya está instalado y autenticado:

```bash
firebase use semiotic-runner-473916-v5 && firebase auth:domains:add localhost && firebase auth:domains:list
```

---

## ⚡ Alternativa usando gcloud CLI (ya viene instalado en Cloud Shell)

```bash
# Primero instala firebase-tools si no está
npm install -g firebase-tools

# Luego ejecuta
firebase login --no-localhost
firebase use semiotic-runner-473916-v5
firebase auth:domains:add localhost
```

---

## ✅ Después de ejecutar los comandos

1. Recarga tu aplicación en http://localhost:3002
2. Click en "Iniciar con Firebase"
3. Ahora debería funcionar correctamente 🎉

---

## 🔍 Troubleshooting

Si el comando `firebase` no se encuentra:
```bash
npm install -g firebase-tools
```

Si tienes problemas de permisos:
```bash
sudo npm install -g firebase-tools
```

Si necesitas ver todos los comandos disponibles:
```bash
firebase auth:domains --help
```
