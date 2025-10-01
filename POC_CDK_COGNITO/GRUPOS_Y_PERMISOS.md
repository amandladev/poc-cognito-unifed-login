# 🔐 Grupos y Permisos en Cognito

## 📋 Resumen

Este stack de CDK crea **dos grupos** con permisos diferenciados:

### 👑 **Grupo: Admins**
- **Role ARN:** `AdminRole`
- **Precedencia:** 1 (mayor prioridad)
- **Permisos:**
  - ✅ Acceso completo a S3 (`s3:*`)
  - ✅ Acceso completo a DynamoDB (`dynamodb:*`)
  - ✅ Gestión de usuarios en Cognito (`cognito-idp:*`)

### 👤 **Grupo: Users**
- **Role ARN:** `UserRole`
- **Precedencia:** 2 (menor prioridad)
- **Permisos:**
  - ✅ Solo lectura en S3 (`s3:GetObject`, `s3:ListBucket`)
  - ✅ Acceso limitado a bucket público
  - ❌ Sin acceso a DynamoDB
  - ❌ Sin acceso a gestión de Cognito

---

## 🚀 Cómo Asignar Usuarios a Grupos

### **Opción 1: AWS Console**

1. Ve a **Amazon Cognito** → Tu User Pool
2. Click en **Groups** en el menú lateral
3. Selecciona el grupo (`Admins` o `Users`)
4. Click en **Add user to group**
5. Selecciona el usuario y confirma

### **Opción 2: AWS CLI**

```bash
# Agregar usuario al grupo Admins
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <USER_POOL_ID> \
  --username <USERNAME> \
  --group-name Admins

# Agregar usuario al grupo Users
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <USER_POOL_ID> \
  --username <USERNAME> \
  --group-name Users

# Ver grupos de un usuario
aws cognito-idp admin-list-groups-for-user \
  --user-pool-id <USER_POOL_ID> \
  --username <USERNAME>

# Remover usuario de un grupo
aws cognito-idp admin-remove-user-from-group \
  --user-pool-id <USER_POOL_ID> \
  --username <USERNAME> \
  --group-name Admins
```

### **Opción 3: Amplify / SDK (desde tu app)**

```typescript
import { adminAddUserToGroup } from 'aws-amplify/auth';

// Requiere credenciales de admin
await adminAddUserToGroup({
  username: 'user@example.com',
  groupName: 'Admins'
});
```

---

## 🔄 Flujo de Permisos

```
┌─────────────────────────────────────────────────────────┐
│  1. Usuario inicia sesión                               │
│     • Username: sergio@example.com                      │
│     • Autenticado en Cognito User Pool                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  2. Cognito verifica grupos del usuario                 │
│     • Grupos: ["Admins"]                                │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  3. Identity Pool asigna rol según grupo                │
│                                                          │
│     Si usuario está en "Admins":                        │
│     → Asigna AdminRole (precedencia 1)                  │
│                                                          │
│     Si usuario está en "Users":                         │
│     → Asigna UserRole (precedencia 2)                   │
│                                                          │
│     Si usuario SIN grupo:                               │
│     → Asigna authenticatedRole (fallback)               │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  4. Usuario obtiene credenciales AWS temporales         │
│     • AccessKeyId: ASIA...                              │
│     • SecretAccessKey: ...                              │
│     • SessionToken: ...                                 │
│     • Permisos según el rol asignado                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Ejemplo de Uso en Frontend

```typescript
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

// Después del login
const user = await getCurrentUser();
const session = await fetchAuthSession();

// Ver grupos del usuario (en el ID Token)
const groups = session.tokens?.idToken?.payload['cognito:groups'];
console.log('Grupos:', groups); // ["Admins"] o ["Users"]

// Usar credenciales AWS según el grupo
const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: session.credentials // Credenciales del rol asignado
});

// Si el usuario es Admin, esto funcionará
// Si es User regular, fallará (sin permisos)
const response = await s3Client.send(new ListBucketsCommand({}));
```

---

## 📊 Tabla de Permisos

| Acción | Admin | User | No Group |
|--------|-------|------|----------|
| Ver buckets S3 | ✅ | ❌ | ❌ |
| Leer objetos S3 | ✅ | ✅ (solo bucket público) | ❌ |
| Escribir en S3 | ✅ | ❌ | ❌ |
| Acceso DynamoDB | ✅ | ❌ | ❌ |
| Gestionar usuarios Cognito | ✅ | ❌ | ❌ |
| Ver info propia Cognito | ✅ | ✅ | ✅ |

---

## 🎯 Mejores Prácticas

1. **Principio de menor privilegio:** Asigna solo los permisos necesarios
2. **Usa precedencia:** Mayor número = menor prioridad (1 > 2 > 3...)
3. **Grupos descriptivos:** Nombres claros (`Admins`, `Users`, `ReadOnly`)
4. **Audita regularmente:** Revisa quién está en qué grupo
5. **Testing:** Prueba con usuarios de diferentes grupos

---

## 🔧 Personalización

Para agregar más grupos o cambiar permisos, edita `cognito-poc-stack.ts`:

```typescript
// Ejemplo: Grupo de solo lectura
const readOnlyRole = new Role(this, 'ReadOnlyRole', {
  assumedBy: new FederatedPrincipal(
    'cognito-identity.amazonaws.com',
    cognitoPrincipalCondition,
    'sts:AssumeRoleWithWebIdentity'
  )
});

readOnlyRole.addManagedPolicy(
  ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess')
);

const readOnlyGroup = new CfnUserPoolGroup(this, 'ReadOnlyGroup', {
  userPoolId: userPool.userPoolId,
  groupName: 'ReadOnly',
  roleArn: readOnlyRole.roleArn,
  precedence: 3
});
```

---

## 📝 Notas Importantes

- **Precedencia:** Si un usuario está en múltiples grupos, se usa el rol del grupo con menor número de precedencia
- **ID Token:** Los grupos aparecen en el claim `cognito:groups` del ID Token
- **Límites:** Un usuario puede estar en hasta **100 grupos**
- **Caché:** Los cambios de grupo pueden tardar hasta **1 hora** en reflejarse (debido a TTL del token)

---

## 🚨 Troubleshooting

**Problema:** Usuario no tiene permisos esperados
```bash
# Verificar grupos del usuario
aws cognito-idp admin-list-groups-for-user \
  --user-pool-id <USER_POOL_ID> \
  --username <USERNAME>

# Verificar rol del grupo
aws cognito-idp get-group \
  --user-pool-id <USER_POOL_ID> \
  --group-name Admins
```

**Problema:** Cambios no se reflejan
- Cierra sesión y vuelve a iniciar (fuerza nuevo token)
- Verifica que el Identity Pool tenga los grupos configurados
- Revisa CloudWatch Logs para errores de asunción de rol
