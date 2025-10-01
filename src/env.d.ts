/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COGNITO_USER_POOL_ID: string;
  readonly VITE_COGNITO_APP_CLIENT_ID: string;
  readonly VITE_AWS_REGION?: string;
  readonly VITE_COGNITO_CLIENTS?: string; // formato nombre:clientId,nombre2:clientId2
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
