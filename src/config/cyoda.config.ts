export interface CyodaConfig {
  apiBase: string;
  token?: string;
}

export const cyodaConfig: CyodaConfig = {
  apiBase: import.meta.env.VITE_CYODA_API_BASE || 'https://api.cyoda.net',
  token: import.meta.env.VITE_CYODA_TOKEN,
};

export const getCyodaConfig = (): CyodaConfig => {
  return cyodaConfig;
};