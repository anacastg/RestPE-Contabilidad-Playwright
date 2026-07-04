import { test as base, type Page } from '@playwright/test';
import { getEnv } from '@config/ambientes';
import { Logger } from '@utils/logger';

/**
 * Fixture base que extiende Playwright test con:
 * - authenticatedPage: página con sesión ya iniciada (vía storageState)
 * - apiContext: contexto de API pre-configurado
 */
export type BaseFixtures = {
  authenticatedPage: Page;
  env: ReturnType<typeof getEnv>;
};

export const test = base.extend<BaseFixtures>({
  // Datos del ambiente actual
  env: async ({}, use) => {
    await use(getEnv());
  },

  // Página autenticada (storageState cargado desde auth.json)
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'auth/auth.json',
    });
    const page = await context.newPage();
    Logger.step('Sesión autenticada cargada desde storageState');
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
