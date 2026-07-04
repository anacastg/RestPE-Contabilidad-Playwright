const { test } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const CFG = {
  username: 'pcastillo',
  password: 'Julienzoe1429*',
  empresa: 'PESQUERA CANTABRIA S.A.',
  sucursal: 'LIMA',
  baseURL: 'https://panel.dev.contabilidad.restaurant.pe',
  outDir: path.resolve(__dirname, '..', '..', 'exploracion-output'),
};

const INVENTORY2 = { screens: [], apis: [] };

async function snooze(page, ms) { await page.waitForTimeout(ms); }
async function dismissOverlay(page) {
  await page.evaluate(() => { const el = document.querySelector('.filtros-absolutos'); if (el) el.style.display = 'none'; }).catch(() => {});
}

async function safeScreenshot(page, name) {
  const fname = path.join(CFG.outDir, 'screenshots', `v2_${name.replace(/[^a-z0-9_-]/gi, '_')}.png`);
  await page.screenshot({ path: fname, fullPage: true }).catch(() => {});
  return fname;
}

async function safeHTML(page, name) {
  const fname = path.join(CFG.outDir, 'html', `v2_${name.replace(/[^a-z0-9_-]/gi, '_')}.html`);
  const html = await page.content().catch(() => '');
  fs.writeFileSync(fname, html);
  return fname;
}

async function discoverComponents(page) {
  const result = {};
  const btns = await page.locator('button:visible, ion-button:visible, a[role="button"]:visible').all();
  result.buttons = [];
  for (const b of btns) {
    const text = await b.textContent().catch(() => '');
    if (text.trim()) result.buttons.push(text.trim().substring(0, 80));
  }
  const inputs = await page.locator('input:visible:not([type="hidden"]), ion-input:visible').all();
  result.inputs = [];
  for (const el of inputs) {
    const ph = await el.getAttribute('placeholder').catch(() => '');
    const tp = await el.getAttribute('type').catch(() => 'text');
    const fc = await el.getAttribute('formcontrolname').catch(() => '');
    result.inputs.push({ type: tp, placeholder: ph || '', formcontrolname: fc || '' });
  }
  const tabs = await page.locator('ion-segment-button:visible, [role="tab"]:visible, .tab-button:visible').all();
  result.tabs = [];
  for (const t of tabs) {
    const text = await t.textContent().catch(() => '');
    if (text.trim()) result.tabs.push(text.trim());
  }
  const headers = await page.locator('.ag-header-cell-text:visible, th:visible').all();
  result.tableColumns = [];
  for (const h of headers) {
    const text = await h.textContent().catch(() => '');
    if (text.trim()) result.tableColumns.push(text.trim());
  }
  const filters = await page.locator('ion-searchbar input:visible, [placeholder*="Buscar"]:visible, [placeholder*="buscar"]:visible, [placeholder*="Filtrar"]:visible').all();
  result.filters = [];
  for (const f of filters) {
    const ph = await f.getAttribute('placeholder').catch(() => '');
    if (ph) result.filters.push(ph);
  }
  const selects = await page.locator('ion-select:visible, select:visible').all();
  result.selects = [];
  for (const el of selects) {
    const text = await el.textContent().catch(() => '');
    if (text.trim()) result.selects.push(text.trim().substring(0, 60));
  }
  // AG Grid rows count
  const gridRows = await page.locator('.ag-row:visible').count().catch(() => 0);
  result.gridRows = gridRows;
  // Modals
  result.modals = await page.locator('ion-modal:visible, [role="dialog"]:visible, .modal:visible').count().catch(() => 0);

  return result;
}

async function login(page) {
  await page.goto(CFG.baseURL + '/auth/signin', { waitUntil: 'networkidle', timeout: 60000 });
  await snooze(page, 3000);
  await page.locator('input[placeholder="usuario@empresa.com"]').fill(CFG.username);
  await page.locator('input[placeholder="**********"]').fill(CFG.password);
  await page.locator('ion-button.button-login, ion-button:has-text("Iniciar Sesión")').click();
  await snooze(page, 5000);
  const rows = page.locator('tr.cursor-pointer');
  await rows.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).textContent();
    if (text?.toLowerCase().includes(CFG.empresa.toLowerCase())) { await rows.nth(i).click(); break; }
  }
  await snooze(page, 3000);
  const rows2 = page.locator('tr.cursor-pointer');
  await rows2.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  const count2 = await rows2.count();
  for (let i = 0; i < count2; i++) {
    const text = await rows2.nth(i).textContent();
    if (text?.toLowerCase().includes(CFG.sucursal.toLowerCase())) { await rows2.nth(i).click(); break; }
  }
  await page.waitForURL(/\/inicio/, { timeout: 20000 }).catch(() => {});
  await snooze(page, 3000);
}

async function explore(page, mod, screen, route) {
  console.log(`\n🔍 ${mod} > ${screen} [${route}]`);
  await page.goto(CFG.baseURL + route, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await snooze(page, 4000);
  await dismissOverlay(page);
  await snooze(page, 1000);
  const url = page.url().replace(CFG.baseURL, '');
  const comp = await discoverComponents(page);
  const entry = {
    module: mod, screen, route, actualUrl: url,
    accessed: url.includes(route.replace(/^\//, '')) || url !== '/auth/signin',
    components: comp,
    screenshot: await safeScreenshot(page, `${mod}_${screen}`),
    html: await safeHTML(page, `${mod}_${screen}`),
  };
  INVENTORY2.screens.push(entry);
  console.log(`   ${entry.accessed ? '✅' : '❌'} Botones:${comp.buttons.length} Inputs:${comp.inputs.length} Tabs:${comp.tabs.length} Cols:${comp.tableColumns.length} Filas:${comp.gridRows} Filtros:${comp.filters.length}`);
  return entry;
}

const ROUTES_V2 = [
  // === CORREGIDAS POR EL USUARIO ===
  { mod: 'Compras', screen: 'Registro Comprobantes', route: '/compras/operaciones/facturas-proveedores' },
  { mod: 'Finanzas', screen: 'Tipos Documento', route: '/finanzas/tabla/tipos-documento' },
  { mod: 'Finanzas', screen: 'Conceptos Financieros', route: '/finanzas/tabla/conceptos-financieros' },
  { mod: 'Finanzas', screen: 'Consulta Flujo Caja', route: '/finanzas/consultas/consultas-flujo-caja' },
  { mod: 'Finanzas', screen: 'Códigos Flujo Caja', route: '/finanzas/tabla/gestion-codigos-flujo-caja' },
  { mod: 'Finanzas', screen: 'Actividades Flujo Caja', route: '/finanzas/tabla/gestion-actividades-flujo-caja' },
  { mod: 'Finanzas', screen: 'Órdenes de Giro', route: '/finanzas/adelantos/ordenes-giro' },
  { mod: 'Finanzas', screen: 'Aprobar Giro', route: '/finanzas/adelantos/aprobar-giro' },
  { mod: 'Finanzas', screen: 'Rendición Gastos', route: '/finanzas/adelantos/rendicion-gastos' },
  { mod: 'Finanzas', screen: 'Aprobar Rendición', route: '/finanzas/adelantos/aprobar-rendicion-gastos' },
  { mod: 'Finanzas', screen: 'Cerrar Liq Adelantos', route: '/finanzas/adelantos/cerrar-liq-adelantos' },
  { mod: 'Contabilidad', screen: 'Plan Contable', route: '/contabilidad/tabla/plan-contable' },
  { mod: 'Contabilidad', screen: 'Centros Costo', route: '/contabilidad/tabla/plan-centro-costo' },
  { mod: 'Contabilidad', screen: 'Tipo de Cambio', route: '/contabilidad/tabla/tipo-de-cambio' },
  { mod: 'RRHH', screen: 'Cálculo Planilla', route: '/rrhh/procesos-de-nomina/calculo-planillas' },
  { mod: 'RRHH', screen: 'Registrar Liquidación', route: '/rrhh/procesos-de-nomina/registrar-liquidacion' },
  { mod: 'RRHH', screen: 'Aprobar Liquidación', route: '/rrhh/procesos-de-nomina/aprobar-liquidacion' },
  { mod: 'RRHH', screen: 'Datos Personales Trab', route: '/rrhh/maestro-personal/datos-contacto' },

  // === YA CONFIRMADAS DEL PRIMER PASO (para verificar consistencia) ===
  { mod: 'Compras', screen: 'Gestión Proveedores', route: '/compras/tabla/gestion-proveedores' },
  { mod: 'Compras', screen: 'Generar OC', route: '/compras/operaciones/ordenes-compra' },
  { mod: 'Compras', screen: 'Aprobar OC', route: '/compras/operaciones/aprobar-compra' },
  { mod: 'RRHH', screen: 'Cargos', route: '/rrhh/maestro-personal/definicion-cargos' },
  { mod: 'RRHH', screen: 'Tipo Contrato', route: '/rrhh/parametros/tipo-contrato' },
  { mod: 'RRHH', screen: 'Asistencias', route: '/rrhh/asistencias-jornadas/asistencias-HE' },

  // === POR DESCUBRIR: rutas de Formatos SUNAT y Libros Electrónicos ===
  { mod: 'Contabilidad', screen: 'Formatos SUNAT', route: '/contabilidad/reportes/formatos-sunat' },
  { mod: 'Contabilidad', screen: 'Libros Electrónicos', route: '/contabilidad/reportes/libros-electronicos' },
];

test.describe('🔍 FASE 3 — 2da Pasada (rutas corregidas)', () => {
  test('Exploración con rutas correctas', async ({ page }) => {
    test.setTimeout(600000);
    fs.mkdirSync(path.join(CFG.outDir, 'screenshots'), { recursive: true });
    fs.mkdirSync(path.join(CFG.outDir, 'html'), { recursive: true });

    page.on('response', async (resp) => {
      const u = resp.url();
      if (u.includes('/api/')) INVENTORY2.apis.push({ method: resp.request().method(), url: u.replace(CFG.baseURL, ''), status: resp.status() });
    });

    console.log('🔐 Login...');
    await login(page);
    console.log('✅ Sesión OK\n');

    const results = [];
    for (const r of ROUTES_V2) {
      results.push(await explore(page, r.mod, r.screen, r.route));
    }

    const invPath = path.join(CFG.outDir, 'inventario-real-v2.json');
    fs.writeFileSync(invPath, JSON.stringify(INVENTORY2, null, 2));

    const active = results.filter(r => r.components.buttons > 0 || r.components.inputs > 0 || r.components.tableColumns > 0).length;
    const withGrid = results.filter(r => r.components.tableColumns.length > 0).length;
    const uniqueApis = [...new Set(INVENTORY2.apis.map(a => a.url))];
    console.log(`\n📊 ${active}/${results.length} pantallas con componentes activos`);
    console.log(`📊 ${withGrid} con tablas de datos`);
    console.log(`📊 ${uniqueApis.length} APIs únicas capturadas`);
    console.log(`📦 ${invPath}`);
  });
});
