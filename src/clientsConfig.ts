export interface AppClientDef {
  key: string; // alias corto (web, admin, mobile, etc.)
  clientId: string;
  label: string; // puede igual a key o algo más descriptivo
}

export function parseClients(envValue?: string): AppClientDef[] {
  if (!envValue) return [];
  return envValue.split(',').map(raw => raw.trim()).filter(Boolean).map(entry => {
    const [left, right] = entry.split(':');
    return {
      key: left || right,
      label: left || right,
      clientId: right || left
    } as AppClientDef;
  }).filter(c => !!c.clientId);
}

export const APP_CLIENTS: AppClientDef[] = parseClients(import.meta.env.VITE_COGNITO_CLIENTS);

export function getDefaultClientId(): string | undefined {
  // Prioridad: explicit VITE_COGNITO_APP_CLIENT_ID, luego primer elemento de lista
  return import.meta.env.VITE_COGNITO_APP_CLIENT_ID || APP_CLIENTS[0]?.clientId;
}
