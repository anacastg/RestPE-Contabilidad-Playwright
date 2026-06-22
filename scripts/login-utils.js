/**
 * login-utils.js — Login helper para Playwright
 *
 * Uso:
 *   const { login } = require('./scripts/login-utils.js');
 *   const { page, context, browser } = await login();
 *   // ... tus pruebas ...
 *   await browser.close();
 */

const { chromium } = require('playwright');

const CREDENTIALS = {
  usuario: 'pcastillo',
  password: 'Julienzoe1429*',
};

const EMPRESA = 'PESQUERA CANTABRIA S.A.';
const SUCURSAL = 'LIMA';

const URLS = {
  login: 'https://panel.dev.contabilidad.restaurant.pe/',
  inicio: '/inicio',
  comprasFacturas: '/compras/operaciones/facturas-proveedores',
  ventasFacturacion: '/ventas/facturacion-de-regalias',
  finanzasSaldos: '/finanzas/consultas/consultas-saldos-caja-bancos',
  finanzasConciliacion: '/finanzas/tesoreria/mov-cuentas-banc-y-cajas',
};

/**
 * Login completo: autenticación → empresa → sucursal → dashboard
 * @param {object} opts - { headless, viewport, credentials, empresa, sucursal }
 * @returns {{ browser, context, page }}
 */
async function login(opts = {}) {
  const {
    headless = true,
    viewport = { width: 1920, height: 1080 },
    credentials = CREDENTIALS,
    empresa = EMPRESA,
    sucursal = SUCURSAL,
  } = opts;

  const browser = await chromium.launch({ headless, args: ['--window-size=1920,1080'] });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  // Paso 1: Login
  await page.goto(URLS.login, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.locator('input[type="text"]').first().fill(credentials.usuario);
  await page.locator('input[type="password"]').first().fill(credentials.password);
  await page.locator('ion-button').filter({ hasText: 'Iniciar Sesión' }).click();
  await page.waitForTimeout(3000);

  // Paso 2: Seleccionar empresa
  await page.locator(`text=${empresa}`).click();
  await page.waitForTimeout(2000);

  // Paso 3: Seleccionar sucursal
  await page.locator(`text=${sucursal}`).first().click();
  await page.waitForTimeout(5000);

  return { browser, context, page };
}

module.exports = { login, URLS, CREDENTIALS };
