import type { PlaywrightTestConfig } from '@playwright/test';

export interface EnvironmentConfig {
  baseURL: string;
  apiURL: string;
  credentials: { username: string; password: string };
  empresa: string;
  sucursal: string;
  pais: 'PE' | 'CO' | 'EC';
}

const ENVS: Record<string, EnvironmentConfig> = {
  dev: {
    baseURL: process.env.BASE_URL || 'https://panel.dev.contabilidad.restaurant.pe',
    apiURL: process.env.API_URL || 'https://panel.dev.contabilidad.restaurant.pe/api',
    credentials: {
      username: process.env.DEV_USER || 'pcastillo',
      password: process.env.DEV_PASS || '',
    },
    empresa: process.env.TEST_EMPRESA || 'PESQUERA CANTABRIA S.A.',
    sucursal: process.env.TEST_SUCURSAL || 'LIMA',
    pais: (process.env.TEST_PAIS as 'PE') || 'PE',
  },
};

export function getEnv(name?: string): EnvironmentConfig {
  const envName = name || process.env.TEST_ENV || 'dev';
  const env = ENVS[envName];
  if (!env) throw new Error(`Ambiente "${envName}" no configurado. Opciones: ${Object.keys(ENVS).join(', ')}`);
  return env;
}

export default ENVS;
