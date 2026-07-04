/**
 * Proyecto de setup: ejecutado UNA vez antes de toda la suite.
 * Realiza login → empresa → sucursal y persiste la sesión en auth/auth.json.
 * Los proyectos de test cargan auth.json y omiten el login.
 */
import { test as setup } from '@playwright/test';
import { getEnv } from '@config/ambientes';
import { Logger } from '@utils/logger';
import { SHARED_SELECTORS as S } from '@selectors/compartidos';

const AUTH_FILE = 'auth/auth.json';

setup('authenticate', async ({ page }) => {
  const env = getEnv();
  Logger.suite('Auth Setup');
  Logger.step(`Login: ${env.credentials.username} @ ${env.baseURL}`);

  // 1. Navegar al login
  await page.goto(env.baseURL + '/auth/signin', { waitUntil: 'networkidle', timeout: 30_000 });
  await page.waitForTimeout(3_000);

  // 2. Credenciales
  await page.locator(S.loginUser).fill(env.credentials.username);
  await page.locator(S.loginPass).fill(env.credentials.password);
  await page.locator(S.loginBtn).click();
  Logger.action('Login', true);
  await page.waitForTimeout(5_000);

  // 3. Seleccionar empresa
  const empresas = page.locator(S.empresaRow);
  await empresas.first().waitFor({ state: 'visible', timeout: 10_000 });
  const empCount = await empresas.count();
  let empresaFound = false;
  for (let i = 0; i < empCount; i++) {
    const text = await empresas.nth(i).textContent();
    if (text?.toLowerCase().includes(env.empresa.toLowerCase())) {
      await empresas.nth(i).click();
      empresaFound = true;
      break;
    }
  }
  if (!empresaFound) throw new Error(`Empresa "${env.empresa}" no encontrada`);
  Logger.action(`Seleccionar empresa: ${env.empresa}`, true);
  await page.waitForTimeout(3_000);

  // 4. Seleccionar sucursal
  const sucursales = page.locator(S.empresaRow);
  await sucursales.first().waitFor({ state: 'visible', timeout: 10_000 });
  const sucCount = await sucursales.count();
  let sucFound = false;
  for (let i = 0; i < sucCount; i++) {
    const text = await sucursales.nth(i).textContent();
    if (text?.toLowerCase().includes(env.sucursal.toLowerCase())) {
      await sucursales.nth(i).click();
      sucFound = true;
      break;
    }
  }
  if (!sucFound) throw new Error(`Sucursal "${env.sucursal}" no encontrada`);
  Logger.action(`Seleccionar sucursal: ${env.sucursal}`, true);

  // 5. Esperar dashboard
  await page.waitForURL(/\/inicio/, { timeout: 20_000 });
  await page.waitForTimeout(2_000);
  Logger.action('Dashboard cargado', true);

  // 6. Persistir sesión
  await page.context().storageState({ path: AUTH_FILE });
  Logger.step(`Sesión guardada en ${AUTH_FILE}`);
});
