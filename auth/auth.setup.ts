/**
 * Proyecto de setup: ejecutado UNA vez antes de toda la suite.
 * Realiza login → empresa → sucursal y persiste la sesión en auth/auth.json.
 * Los proyectos de test cargan auth.json y omiten el login.
 */
import { test as setup } from '@playwright/test';
import { Logger } from '@utils/logger';

const AUTH_FILE = 'auth/auth.json';

setup('authenticate', async ({ page }) => {
  // Credenciales — mismo valor que el smoke test funcional
  const username = process.env.DEV_USER || 'pcastillo';
  const password = process.env.DEV_PASS || 'Julienzoe1429*';
  const empresa = process.env.TEST_EMPRESA || 'PESQUERA CANTABRIA S.A.';
  const sucursal = process.env.TEST_SUCURSAL || 'LIMA';

  Logger.suite('Auth Setup');
  Logger.step(`Login: ${username}`);

  const BASE = process.env.BASE_URL || 'https://panel.dev.contabilidad.restaurant.pe';

  // 1. Navegar al login
  await page.goto(BASE + '/auth/signin', { waitUntil: 'networkidle', timeout: 30_000 });
  await page.waitForTimeout(3_000);

  // 2. Credenciales — mismo patrón que el smoke test funcional
  await page.locator('input[placeholder="usuario@empresa.com"]').fill(username);
  await page.locator('input[placeholder="**********"]').fill(password);
  await page.locator('ion-button.button-login').click();
  await page.waitForTimeout(5_000);

  // Check if login navigated
  const afterLoginUrl = page.url();
  const isOnEmpresaPage = afterLoginUrl.includes('seleccion-razon-social');
  Logger.action(`Login → ${isOnEmpresaPage ? 'navegó a empresa' : `se quedó en ${afterLoginUrl.replace(BASE, '')}`}`, isOnEmpresaPage);

  if (!isOnEmpresaPage) {
    await page.waitForTimeout(3_000);
    const stillOnLogin = page.url().includes('signin');
    if (stillOnLogin) {
      throw new Error('Login falló: credenciales inválidas o servidor no disponible');
    }
  }

  // 3. Seleccionar empresa
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2_000);
  const empresas = page.locator('tr.cursor-pointer');
  await empresas.first().waitFor({ state: 'visible', timeout: 30_000 });
  const empCount = await empresas.count();
  let empresaFound = false;
  for (let i = 0; i < empCount; i++) {
    const text = await empresas.nth(i).textContent();
    if (text?.toLowerCase().includes(empresa.toLowerCase())) {
      await empresas.nth(i).click();
      empresaFound = true;
      break;
    }
  }
  if (!empresaFound) throw new Error(`Empresa "${empresa}" no encontrada`);
  Logger.action(`Seleccionar empresa: ${empresa}`, true);
  await page.waitForTimeout(3_000);

  // 4. Seleccionar sucursal
  const sucursales = page.locator('tr.cursor-pointer');
  await sucursales.first().waitFor({ state: 'visible', timeout: 10_000 });
  const sucCount = await sucursales.count();
  let sucFound = false;
  for (let i = 0; i < sucCount; i++) {
    const text = await sucursales.nth(i).textContent();
    if (text?.toLowerCase().includes(sucursal.toLowerCase())) {
      await sucursales.nth(i).click();
      sucFound = true;
      break;
    }
  }
  if (!sucFound) throw new Error(`Sucursal "${sucursal}" no encontrada`);
  Logger.action(`Seleccionar sucursal: ${sucursal}`, true);

  // 5. Esperar dashboard
  await page.waitForURL(/\/inicio/, { timeout: 20_000 });
  await page.waitForTimeout(2_000);
  Logger.action('Dashboard cargado', true);

  // 6. Persistir sesión
  await page.context().storageState({ path: AUTH_FILE });
  Logger.step(`Sesión guardada en ${AUTH_FILE}`);
});
