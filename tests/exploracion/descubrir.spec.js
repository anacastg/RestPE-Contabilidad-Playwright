const { test, expect } = require('@playwright/test');
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

const INVENTORY = { screens: [], apis: [], navigation: {} };
const API_CALLS = [];

// ─── Helpers ───────────────────────────────────────────────

async function snooze(page, ms) { await page.waitForTimeout(ms); }

async function dismissOverlay(page) {
  await page.evaluate(() => {
    const el = document.querySelector('.filtros-absolutos');
    if (el) el.style.display = 'none';
  }).catch(() => {});
}

async function safeScreenshot(page, name) {
  const fname = path.join(CFG.outDir, 'screenshots', `${name.replace(/[^a-z0-9_-]/gi, '_')}.png`);
  await page.screenshot({ path: fname, fullPage: true }).catch(() => {});
  return fname;
}

async function safeHTML(page, name) {
  const fname = path.join(CFG.outDir, 'html', `${name.replace(/[^a-z0-9_-]/gi, '_')}.html`);
  const html = await page.content().catch(() => '');
  fs.writeFileSync(fname, html);
  return fname;
}

// ─── Component Discovery ───────────────────────────────────

async function discoverComponents(page) {
  const result = {};

  // Buttons
  const btns = await page.locator('button, ion-button, a[role="button"]').all();
  result.buttons = [];
  for (const b of btns) {
    const text = await b.textContent().catch(() => '');
    const visible = await b.isVisible().catch(() => false);
    if (visible && text.trim()) result.buttons.push(text.trim().substring(0, 80));
  }

  // Inputs
  const inputs = await page.locator('input:not([type="hidden"]), ion-input').all();
  result.inputs = [];
  for (const el of inputs) {
    const placeholder = await el.getAttribute('placeholder').catch(() => '');
    const type = await el.getAttribute('type').catch(() => 'text');
    const fcn = await el.getAttribute('formcontrolname').catch(() => '');
    const visible = await el.isVisible().catch(() => false);
    if (visible) {
      result.inputs.push({ type, placeholder: placeholder || '', formcontrolname: fcn || '' });
    }
  }

  // Selects
  const selects = await page.locator('ion-select, select').all();
  result.selects = [];
  for (const el of selects) {
    const text = await el.textContent().catch(() => '');
    const visible = await el.isVisible().catch(() => false);
    if (visible && text.trim()) result.selects.push(text.trim().substring(0, 60));
  }

  // Tabs
  const tabs = await page.locator('ion-segment-button, [role="tab"], .tab-button').all();
  result.tabs = [];
  for (const t of tabs) {
    const text = await t.textContent().catch(() => '');
    const visible = await t.isVisible().catch(() => false);
    if (visible && text.trim()) result.tabs.push(text.trim());
  }

  // Tables / AG Grid
  const headers = await page.locator('.ag-header-cell-text, th, .data-table-header').all();
  result.tableColumns = [];
  for (const h of headers) {
    const text = await h.textContent().catch(() => '');
    const visible = await h.isVisible().catch(() => false);
    if (visible && text.trim()) result.tableColumns.push(text.trim());
  }

  // Filter elements
  const filters = await page.locator('ion-searchbar input, [placeholder*="Buscar"], [placeholder*="buscar"], [placeholder*="Filtrar"]').all();
  result.filters = [];
  for (const f of filters) {
    const placeholder = await f.getAttribute('placeholder').catch(() => '');
    const visible = await f.isVisible().catch(() => false);
    if (visible) result.filters.push(placeholder);
  }

  // Links / Navigation
  const links = await page.locator('a[href], [routerlink]').all();
  result.links = [];
  for (const l of links) {
    const href = await l.getAttribute('href').catch(() => '') || await l.getAttribute('routerlink').catch(() => '') || '';
    const text = await l.textContent().catch(() => '');
    const visible = await l.isVisible().catch(() => false);
    if (visible && (href || text.trim())) {
      result.links.push({ text: text.trim().substring(0, 60), href });
    }
  }

  return result;
}

// ─── Login Flow ────────────────────────────────────────────

async function login(page) {
  await page.goto(CFG.baseURL + '/auth/signin', { waitUntil: 'networkidle', timeout: 60000 });
  await snooze(page, 3000);

  await page.locator('input[placeholder="usuario@empresa.com"]').fill(CFG.username);
  await page.locator('input[placeholder="**********"]').fill(CFG.password);
  await page.locator('ion-button.button-login, ion-button:has-text("Iniciar Sesión")').click();
  await snooze(page, 5000);

  // Company selection
  const rows = page.locator('tr.cursor-pointer');
  await rows.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).textContent();
    if (text?.toLowerCase().includes(CFG.empresa.toLowerCase())) {
      await rows.nth(i).click();
      break;
    }
  }
  await snooze(page, 3000);

  // Branch selection
  const rows2 = page.locator('tr.cursor-pointer');
  await rows2.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  const count2 = await rows2.count();
  for (let i = 0; i < count2; i++) {
    const text = await rows2.nth(i).textContent();
    if (text?.toLowerCase().includes(CFG.sucursal.toLowerCase())) {
      await rows2.nth(i).click();
      break;
    }
  }
  await page.waitForURL(/\/inicio/, { timeout: 20000 }).catch(() => {});
  await snooze(page, 3000);
}

// ─── Screen Explorer ───────────────────────────────────────

async function exploreScreen(page, route, moduleName, screenName) {
  console.log(`\n🔍 Explorando: ${moduleName} > ${screenName} [${route}]`);

  await page.goto(CFG.baseURL + route, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await snooze(page, 4000);
  await dismissOverlay(page);
  await snooze(page, 1000);

  const currentUrl = page.url();
  const title = await page.title().catch(() => '');
  const bodyText = await page.locator('body').textContent().catch(() => '').then(t => t?.substring(0, 500) || '');

  const components = await discoverComponents(page);

  const entry = {
    module: moduleName,
    screen: screenName,
    route,
    actualUrl: currentUrl,
    title,
    accessed: currentUrl.includes(route) || !currentUrl.includes('signin'),
    bodyPreview: bodyText,
    components,
    apiCalls: [],
    screenshot: '',
    html: '',
  };

  // Screenshot
  entry.screenshot = await safeScreenshot(page, `${moduleName}_${screenName}`);
  entry.html = await safeHTML(page, `${moduleName}_${screenName}`);

  INVENTORY.screens.push(entry);
  return entry;
}

// ─── API Capture ───────────────────────────────────────────

async function setupAPICapture(page) {
  page.on('response', async (response) => {
    try {
      const url = response.url();
      if (url.includes('panel.dev.contabilidad.restaurant.pe/api/')) {
        const req = response.request();
        API_CALLS.push({
          method: req.method(),
          url: url.replace(CFG.baseURL, ''),
          status: response.status(),
          contentType: response.headers()['content-type'] || '',
          timestamp: new Date().toISOString(),
        });
        INVENTORY.apis.push(url.replace(CFG.baseURL, ''));
      }
    } catch (e) { /* skip */ }
  });
}

// ─── Sidebar Discovery ──────────────────────────────────────

async function discoverSidebar(page) {
  await page.goto(CFG.baseURL + '/inicio', { waitUntil: 'networkidle' }).catch(() => {});
  await snooze(page, 3000);

  // Get sidebar links
  const sidebarLinks = await page.locator('app-sidebar a, ion-menu a, nav a, [class*="sidebar"] a').all();
  const modules = [];
  for (const link of sidebarLinks) {
    const text = await link.textContent().catch(() => '');
    const href = await link.getAttribute('href').catch(() => '');
    const visible = await link.isVisible().catch(() => false);
    if (visible && text.trim()) {
      modules.push({ text: text.trim(), href: href || '' });
    }
  }
  return modules;
}

// ─── ROUTES TO EXPLORE ──────────────────────────────────────

const ROUTES = [
  // Sprint 1 — Confirmadas
  { module: 'Compras', screen: 'Gestión Proveedores', route: '/compras/tabla/gestion-proveedores' },
  { module: 'Compras', screen: 'Generar OC', route: '/compras/operaciones/ordenes-compra' },
  { module: 'Compras', screen: 'Aprobar OC', route: '/compras/operaciones/aprobar-compra' },
  { module: 'Compras', screen: 'Registro Comprobantes', route: '/compras/operaciones/registro-comprobantes' },
  { module: 'Compras', screen: 'Gestión Compras', route: '/compras/reportes/gestion-compras' },
  { module: 'Ventas', screen: 'Facturación Regalías', route: '/ventas/facturacion-de-regalias' },
  { module: 'Finanzas', screen: 'Consulta Saldos', route: '/finanzas/consultas/consultas-saldos-caja-bancos' },
  { module: 'Finanzas', screen: 'Mov Cuentas', route: '/finanzas/tesoreria/mov-cuentas-banc-y-cajas' },

  // Sprint 2 — Por descubrir
  { module: 'Finanzas', screen: 'Tipos Documento', route: '/finanzas/documentos/tipos-documentos' },
  { module: 'Finanzas', screen: 'Conceptos Financieros', route: '/finanzas/concepto-financiero' },
  { module: 'Finanzas', screen: 'Flujo de Caja', route: '/finanzas/flujo-caja' },
  { module: 'Finanzas', screen: 'Solicitud Adelantos', route: '/finanzas/solicitud-adelantos' },
  { module: 'Finanzas', screen: 'Cartera Pagos', route: '/finanzas/tesoreria/cartera-pagos' },
  { module: 'Finanzas', screen: 'Transferencias', route: '/finanzas/transferencias' },
  { module: 'Contabilidad', screen: 'Plan Contable', route: '/contabilidad/plan-contable' },
  { module: 'Contabilidad', screen: 'Centros Costo', route: '/contabilidad/centros-costo' },
  { module: 'Contabilidad', screen: 'Tipo Cambio', route: '/contabilidad/tipo-cambio' },
  { module: 'Contabilidad', screen: 'Formatos SUNAT', route: '/contabilidad/formatos-sunat' },
  { module: 'Contabilidad', screen: 'Libros Electrónicos', route: '/contabilidad/libros-electronicos' },

  // Sprint 3
  { module: 'Activos Fijos', screen: 'Maestro AF', route: '/activos/maestro' },
  { module: 'Activos Fijos', screen: 'Parámetros AF', route: '/activos/parametros' },
  { module: 'Activos Fijos', screen: 'Operaciones AF', route: '/activos/operaciones' },
  { module: 'Activos Fijos', screen: 'Procesos AF', route: '/activos/procesos' },
  { module: 'RRHH', screen: 'Datos Personal', route: '/rrhh/maestro-personal/datos-contacto' },
  { module: 'RRHH', screen: 'Cargos', route: '/rrhh/maestro-personal/definicion-cargos' },

  // Sprint 4
  { module: 'RRHH', screen: 'Tipo Contrato', route: '/rrhh/parametros/tipo-contrato' },
  { module: 'RRHH', screen: 'Asistencias', route: '/rrhh/asistencias-jornadas/asistencias-HE' },
  { module: 'RRHH', screen: 'Cálculo Planilla', route: '/rrhh/calculo-planilla' },
  { module: 'RRHH', screen: 'Liquidaciones', route: '/rrhh/liquidaciones' },

  // Dashboard
  { module: 'Dashboard', screen: 'Inicio', route: '/inicio' },
];

// ─── Main Test ─────────────────────────────────────────────

test.describe('🔍 FASE 3 — Descubrimiento Funcional', () => {

  test('Exploración completa de la aplicación', async ({ page }) => {
    test.setTimeout(600000); // 10 min

    // Setup
    fs.mkdirSync(path.join(CFG.outDir, 'screenshots'), { recursive: true });
    fs.mkdirSync(path.join(CFG.outDir, 'html'), { recursive: true });
    await setupAPICapture(page);

    // Login
    console.log('🔐 Iniciando sesión...');
    await login(page);
    console.log('✅ Sesión iniciada');

    // Dashboard sidebar
    console.log('\n📋 Descubriendo sidebar...');
    const sidebarModules = await discoverSidebar(page);
    INVENTORY.navigation.sidebar = sidebarModules;
    console.log(`📋 Sidebar: ${sidebarModules.length} módulos encontrados`);
    sidebarModules.forEach(m => console.log(`   ${m.text} → ${m.href}`));

    // Explore each route
    const results = [];
    for (const r of ROUTES) {
      const entry = await exploreScreen(page, r.route, r.module, r.screen);
      results.push(entry);
      console.log(`   ${entry.accessed ? '✅' : '❌'} ${r.screen} → ${entry.actualUrl.split('/').pop() || '/'}`);
      console.log(`      Botones: ${entry.components.buttons.length}, Inputs: ${entry.components.inputs.length}, Tabs: ${entry.components.tabs.length}, Columnas: ${entry.components.tableColumns.length}`);
    }

    // Save inventory
    const invPath = path.join(CFG.outDir, 'inventario-real.json');
    fs.writeFileSync(invPath, JSON.stringify(INVENTORY, null, 2));
    console.log(`\n📦 Inventario guardado: ${invPath}`);
    console.log(`   Pantallas exploradas: ${INVENTORY.screens.length}`);
    console.log(`   APIs capturadas: ${INVENTORY.apis.length}`);

    // Build comparison report
    const comparison = buildComparison(INVENTORY);
    const compPath = path.join(CFG.outDir, 'comparacion-doc-vs-app.json');
    fs.writeFileSync(compPath, JSON.stringify(comparison, null, 2));
    console.log(`📊 Comparación guardada: ${compPath}`);

    // Generate markdown report
    const mdReport = generateMarkdownReport(INVENTORY, comparison);
    const mdPath = path.join(CFG.outDir, 'informe-descubrimiento.md');
    fs.writeFileSync(mdPath, mdReport);
    console.log(`📝 Informe guardado: ${mdPath}`);

    // Basic assertions
    expect(results.length).toBeGreaterThan(0);
    const accessible = results.filter(r => r.accessed).length;
    console.log(`\n📊 Resumen: ${accessible}/${results.length} pantallas accesibles (${Math.round(accessible/results.length*100)}%)`);
  });
});

// ─── Comparison Engine ─────────────────────────────────────

function buildComparison(inventory) {
  const DOC_SCREENS = [
    'Gestión Proveedores', 'Generar OC', 'Aprobar OC', 'Registro Comprobantes',
    'Gestión Compras', 'Facturación Regalías', 'Consulta Saldos', 'Mov Cuentas',
    'Tipos Documento', 'Conceptos Financieros', 'Flujo de Caja', 'Solicitud Adelantos',
    'Cartera Pagos', 'Transferencias', 'Plan Contable', 'Centros Costo', 'Tipo Cambio',
    'Formatos SUNAT', 'Libros Electrónicos', 'Maestro AF', 'Parámetros AF',
    'Operaciones AF', 'Procesos AF', 'Datos Personal', 'Cargos', 'Tipo Contrato',
    'Asistencias', 'Cálculo Planilla', 'Liquidaciones', 'Inicio',
  ];

  const comparison = {
    enDocumentacionYAplicacion: [],
    soloEnDocumentacion: [],
    soloEnAplicacion: [],
    diferencias: [],
  };

  const exploredScreens = inventory.screens.map(s => s.screen);

  for (const docScreen of DOC_SCREENS) {
    const found = inventory.screens.find(s => s.screen === docScreen);
    if (found && found.accessed) {
      comparison.enDocumentacionYAplicacion.push({
        screen: docScreen,
        module: found.module,
        route: found.route,
        actualUrl: found.actualUrl,
        components: { buttons: found.components.buttons.length, inputs: found.components.inputs.length, tabs: found.components.tabs.length, tableColumns: found.components.tableColumns.length },
      });
    } else if (found && !found.accessed) {
      comparison.diferencias.push({ screen: docScreen, tipo: 'Error de acceso', detalle: `Ruta ${found.route} → ${found.actualUrl}` });
    } else {
      comparison.soloEnDocumentacion.push({ screen: docScreen });
    }
  }

  for (const screen of exploredScreens) {
    if (!DOC_SCREENS.includes(screen) && screen !== 'unknown') {
      comparison.soloEnAplicacion.push({ screen, url: inventory.screens.find(s => s.screen === screen)?.actualUrl });
    }
  }

  return comparison;
}

function generateMarkdownReport(inventory, comparison) {
  let md = `# INFORME DE DESCUBRIMIENTO FUNCIONAL — RestPE Contabilidad

> **Fecha:** ${new Date().toISOString().split('T')[0]}
> **Ambiente:** ${CFG.baseURL}
> **Usuario:** ${CFG.username}
> **Empresa:** ${CFG.empresa}

---

## 1. Resumen

| Métrica | Valor |
|:--------|:------|
| Pantallas exploradas | ${inventory.screens.length} |
| APIs capturadas | ${inventory.apis.length} |
| Módulos sidebar | ${inventory.navigation.sidebar?.length || 0} |
| En doc y app | ${comparison.enDocumentacionYAplicacion.length} |
| Solo en doc | ${comparison.soloEnDocumentacion.length} |
| Solo en app | ${comparison.soloEnAplicacion.length} |
| Con diferencias | ${comparison.diferencias.length} |

---

## 2. Sidebar Descubierto

${(inventory.navigation.sidebar || []).map(m => `- **${m.text}** → \`${m.href}\``).join('\n')}

---

## 3. Inventario de Pantallas

| Módulo | Pantalla | Ruta intentada | URL real | Acceso |
|:-------|:---------|:---------------|:---------|:------:|
${inventory.screens.map(s => `| ${s.module} | ${s.screen} | \`${s.route}\` | \`${s.actualUrl.replace(CFG.baseURL, '')}\` | ${s.accessed ? '✅' : '❌'} |`).join('\n')}

---

## 4. Componentes por Pantalla

| Pantalla | Botones | Inputs | Tabs | Columnas | Filtros |
|:---------|:-------:|:------:|:----:|:--------:|:-------:|
${inventory.screens.map(s => `| ${s.screen} | ${s.components.buttons.length} | ${s.components.inputs.length} | ${s.components.tabs.length} | ${s.components.tableColumns.length} | ${s.components.filters.length} |`).join('\n')}

---

## 5. APIs Capturadas

${inventory.apis.filter((v, i, a) => a.indexOf(v) === i).sort().map(api => `- \`${api}\``).join('\n')}

---

## 6. Comparación Documentación vs Aplicación

### 6.1 Coinciden (${comparison.enDocumentacionYAplicacion.length})

| Pantalla | Módulo | Botones | Inputs | Tabs | Columnas |
|:---------|:-------|:-------:|:------:|:----:|:--------:|
${comparison.enDocumentacionYAplicacion.map(s => `| ${s.screen} | ${s.module} | ${s.components.buttons} | ${s.components.inputs} | ${s.components.tabs} | ${s.components.tableColumns} |`).join('\n')}

### 6.2 Solo en Documentación (${comparison.soloEnDocumentacion.length})

${comparison.soloEnDocumentacion.map(s => `- **${s.screen}** — No encontrada en la aplicación`).join('\n')}

### 6.3 Solo en Aplicación (${comparison.soloEnAplicacion.length})

${comparison.soloEnAplicacion.map(s => `- **${s.screen}** → \`${s.url}\``).join('\n')}

### 6.4 Diferencias / Errores (${comparison.diferencias.length})

${comparison.diferencias.map(d => `- **${d.screen}**: ${d.tipo} — ${d.detalle}`).join('\n')}

---

## 7. Hallazgos Clasificados

| Tipo | Pantalla | Descripción |
|:-----|:---------|:------------|
${comparison.diferencias.map(d => `| Error de acceso | ${d.screen} | ${d.detalle} |`).join('\n')}
${comparison.soloEnDocumentacion.map(s => `| Documentación desactualizada | ${s.screen} | Pantalla documentada no encontrada en la app |`).join('\n')}
${comparison.soloEnAplicacion.map(s => `| Funcionalidad no documentada | ${s.screen} | Pantalla existe en la app pero no en la documentación |`).join('\n')}

---

*Informe generado automáticamente por Playwright — Fase 3 Descubrimiento Funcional*
`;

  return md;
}
