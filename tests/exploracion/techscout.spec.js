const { test } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const OUT = path.resolve(__dirname, '..', '..', 'exploracion-output', 'tecnico');
const BASE = 'https://panel.dev.contabilidad.restaurant.pe';

// ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
//  TECHSCOUT — Deep technical scraper for Playwright automation
// ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

async function snooze(p, ms) { await p.waitForTimeout(ms); }

async function dismiss(p) {
  await p.evaluate(() => { const el = document.querySelector('.filtros-absolutos'); if (el) el.style.display = 'none'; }).catch(() => {});
}

// ─── DEEP FIELD EXTRACTOR ───────────────────────────────────

async function extractFields(page) {
  const fields = [];

  // ion-input
  const ionInputs = await page.locator('ion-input').all();
  for (const el of ionInputs) {
    const visible = await el.isVisible().catch(() => false);
    if (!visible) continue;
    const fcn = await el.getAttribute('formcontrolname').catch(() => '');
    const innerInput = el.locator('input');
    const type = await innerInput.getAttribute('type').catch(() => 'text');
    const placeholder = await innerInput.getAttribute('placeholder').catch(() => '');
    const disabled = await innerInput.isDisabled().catch(() => false);
    const readonly = await innerInput.getAttribute('readonly').catch(() => null) !== null;
    const required = await innerInput.getAttribute('required').catch(() => null) !== null;
    const min = await innerInput.getAttribute('min').catch(() => '');
    const max = await innerInput.getAttribute('max').catch(() => '');
    const maxlength = await innerInput.getAttribute('maxlength').catch(() => '');
    const autocomplete = await innerInput.getAttribute('autocomplete').catch(() => '');
    const val = await innerInput.inputValue().catch(() => '');

    // Find associated label
    const labelEl = el.locator('..').locator('ion-label, label').first();
    let label = '';
    try { label = await labelEl.textContent({ timeout: 500 }); } catch (e) {}

    // Selector recommendation
    let selector = '';
    if (fcn) selector = `ion-input[formcontrolname="${fcn}"] input`;
    else if (placeholder) selector = `input[placeholder="${placeholder}"]`;
    else selector = `ion-input:nth-child(${fields.length + 1}) input`;

    fields.push({
      tag: 'ion-input',
      formControlName: fcn,
      label: label?.trim() || '',
      type,
      placeholder,
      disabled,
      readonly,
      required,
      min,
      max,
      maxlength,
      autocomplete,
      value: val,
      selector,
      stability: fcn ? 'ALTA' : (placeholder ? 'MEDIA' : 'BAJA'),
    });
  }

  // ion-select
  const ionSelects = await page.locator('ion-select').all();
  for (const el of ionSelects) {
    const visible = await el.isVisible().catch(() => false);
    if (!visible) continue;
    const fcn = await el.getAttribute('formcontrolname').catch(() => '');
    const placeholder = await el.getAttribute('placeholder').catch(() => '');
    const disabled = await el.isDisabled().catch(() => false);
    const value = await el.getAttribute('value').catch(() => '') || '';
    const labelEl = el.locator('..').locator('ion-label, label').first();
    let label = '';
    try { label = await labelEl.textContent({ timeout: 500 }); } catch (e) {}

    // Try to click and get options
    let options = [];
    try {
      await el.click();
      await snooze(page, 500);
      const opts = page.locator('ion-alert button, ion-action-sheet button, .select-interface-option, ion-select-popover button');
      const optCount = await opts.count();
      for (let i = 0; i < optCount; i++) {
        const txt = await opts.nth(i).textContent().catch(() => '');
        if (txt.trim()) options.push(txt.trim());
      }
      await page.keyboard.press('Escape');
      await snooze(page, 300);
    } catch (e) {}

    fields.push({
      tag: 'ion-select',
      formControlName: fcn,
      label: label?.trim() || '',
      placeholder,
      disabled,
      value,
      options,
      selector: fcn ? `ion-select[formcontrolname="${fcn}"]` : `ion-select:nth-child(${fields.length + 1})`,
      stability: fcn ? 'ALTA' : 'BAJA',
    });
  }

  // ion-checkbox
  const checks = await page.locator('ion-checkbox').all();
  for (const el of checks) {
    const visible = await el.isVisible().catch(() => false);
    if (!visible) continue;
    const fcn = await el.getAttribute('formcontrolname').catch(() => '');
    const checked = await el.getAttribute('checked').catch(() => null) !== null;
    const labelEl = el.locator('..').locator('ion-label, label').first();
    let label = '';
    try { label = await labelEl.textContent({ timeout: 500 }); } catch (e) {}
    fields.push({
      tag: 'ion-checkbox',
      formControlName: fcn,
      label: label?.trim() || '',
      checked,
      selector: fcn ? `ion-checkbox[formcontrolname="${fcn}"]` : '',
      stability: fcn ? 'ALTA' : 'BAJA',
    });
  }

  // ion-textarea
  const textareas = await page.locator('ion-textarea').all();
  for (const el of textareas) {
    const visible = await el.isVisible().catch(() => false);
    if (!visible) continue;
    const fcn = await el.getAttribute('formcontrolname').catch(() => '');
    const placeholder = await el.getAttribute('placeholder').catch(() => '');
    const disabled = await el.isDisabled().catch(() => false);
    fields.push({
      tag: 'ion-textarea',
      formControlName: fcn,
      placeholder,
      disabled,
      selector: fcn ? `ion-textarea[formcontrolname="${fcn}"] textarea` : '',
      stability: fcn ? 'ALTA' : 'BAJA',
    });
  }

  return fields;
}

// ─── BUTTON EXTRACTOR ──────────────────────────────────────

async function extractButtons(page) {
  const buttons = [];
  const all = await page.locator('button:visible, ion-button:visible').all();
  for (const b of all) {
    const text = (await b.textContent().catch(() => ''))?.trim();
    if (!text) continue;
    const disabled = await b.isDisabled().catch(() => false);
    const type = await b.getAttribute('type').catch(() => 'button');
    const color = await b.getAttribute('color').catch(() => '');
    const fill = await b.getAttribute('fill').catch(() => '');
    const icon = await b.locator('ion-icon').count().catch(() => 0);
    const formAction = await b.getAttribute('formaction').catch(() => '');

    buttons.push({
      text: text.substring(0, 100),
      type,
      disabled,
      color,
      fill,
      hasIcon: icon > 0,
      formAction,
      selector: `button:has-text("${text.substring(0, 30)}"), ion-button:has-text("${text.substring(0, 30)}")`,
    });
  }
  return buttons;
}

// ─── TABS EXTRACTOR ────────────────────────────────────────

async function extractTabs(page) {
  const tabs = [];
  const all = await page.locator('ion-segment-button:visible, [role="tab"]:visible, ion-tab-button:visible').all();
  for (let i = 0; i < all.length; i++) {
    const text = (await all[i].textContent().catch(() => ''))?.trim();
    if (!text) continue;
    const selected = await all[i].getAttribute('aria-selected').catch(() => '') === 'true' ||
                     await all[i].getAttribute('checked').catch(() => null) !== null;
    tabs.push({ index: i, name: text, selected, selector: `ion-segment-button:nth-child(${i + 1}), [role="tab"]:has-text("${text}")` });
  }
  return tabs;
}

// ─── AG GRID EXTRACTOR ─────────────────────────────────────

async function extractGrid(page) {
  const grid = { type: 'AG Grid', columns: [], rows: 0, features: {} };

  // Columns
  const headers = await page.locator('.ag-header-cell-text').all();
  for (let i = 0; i < headers.length; i++) {
    const text = (await headers[i].textContent().catch(() => ''))?.trim();
    if (!text) continue;
    const parent = headers[i].locator('..');
    const sortable = (await parent.getAttribute('aria-sort').catch(() => '')) !== '' ||
                     (await parent.locator('.ag-header-icon').count().catch(() => 0)) > 0;
    grid.columns.push({ index: i, name: text, sortable });
  }

  grid.rows = await page.locator('.ag-row:visible').count().catch(() => 0);

  // Actions per row
  const firstRowActions = await page.locator('.ag-row:visible').first().locator('button, ion-button, ion-icon').all();
  grid.rowActions = [];
  for (const a of firstRowActions) {
    const txt = (await a.textContent().catch(() => ''))?.trim();
    const iconName = await a.getAttribute('name').catch(() => '') || await a.locator('ion-icon').getAttribute('name').catch(() => '') || '';
    if (txt || iconName) grid.rowActions.push({ text: txt.substring(0, 40), icon: iconName });
  }

  // Features
  grid.features.export = await page.locator('button:has-text("Exportar"), ion-button:has-text("Exportar"), [title*="Export"]:visible').count().catch(() => 0) > 0;
  grid.features.pagination = await page.locator('.ag-paging-panel, .ag-paging-button, .pagination').count().catch(() => 0) > 0;
  grid.features.filters = await page.locator('.ag-floating-filter, ion-searchbar, [placeholder*="Buscar"]').count().catch(() => 0) > 0;
  grid.features.selection = await page.locator('.ag-checkbox:visible, ion-checkbox.ag-checkbox').count().catch(() => 0) > 0;

  return grid;
}

// ─── MODAL EXTRACTOR ───────────────────────────────────────

async function extractModals(page) {
  const modals = [];
  const all = await page.locator('ion-modal:visible, [role="dialog"]:visible, .modal:visible, ion-popover:visible').all();
  for (const m of all) {
    const title = await m.locator('ion-title, [class*="modal-title"], h2, h3').first().textContent().catch(() => '');
    const btnCount = await m.locator('button, ion-button').count().catch(() => 0);
    modals.push({ title: title?.trim() || '', buttons: btnCount, visible: true });
  }
  return modals;
}

// ─── VALIDATION MESSAGES ────────────────────────────────────

async function extractValidations(page) {
  const msgs = [];
  const all = await page.locator('ion-text[color="danger"]:visible, .error-message:visible, [role="alert"]:visible, .validation-error:visible').all();
  for (const m of all) {
    const text = (await m.textContent().catch(() => ''))?.trim();
    if (text) msgs.push({ text, type: 'validation' });
  }
  // Toast
  const toasts = await page.locator('ion-toast:visible').all();
  for (const t of toasts) {
    const msg = await t.locator('.toast-message').textContent().catch(() => '');
    if (msg) msgs.push({ text: msg.trim(), type: 'toast' });
  }
  return msgs;
}

// ─── CSS CLASS EXTRACTOR (for component patterns) ───────────

async function extractCSSPatterns(page) {
  const patterns = {};
  // Detect reusable component patterns
  const hasAppAutocomplete = await page.locator('app-autocomplete').count().catch(() => 0);
  const hasAppSelectorBusqueda = await page.locator('app-selector-busqueda').count().catch(() => 0);
  const hasAppBaseCalendar = await page.locator('app-base-calendar-new').count().catch(() => 0);
  const hasAppSidebar = await page.locator('app-sidebar').count().catch(() => 0);
  const hasAppHeader = await page.locator('app-header').count().catch(() => 0);
  if (hasAppAutocomplete) patterns['app-autocomplete'] = { type: 'reusable', desc: 'Buscador con autocompletado' };
  if (hasAppSelectorBusqueda) patterns['app-selector-busqueda'] = { type: 'reusable', desc: 'Selector desplegable con búsqueda' };
  if (hasAppBaseCalendar) patterns['app-base-calendar-new'] = { type: 'reusable', desc: 'Componente calendario' };
  if (hasAppSidebar) patterns['app-sidebar'] = { type: 'layout', desc: 'Sidebar de navegación' };
  if (hasAppHeader) patterns['app-header'] = { type: 'layout', desc: 'Header con selector país/empresa/sucursal' };
  return patterns;
}

// ─── MAIN SCOUT FUNCTION ───────────────────────────────────

async function scoutScreen(page, module, screen, route) {
  console.log(`\n🔬 ${module} > ${screen}`);
  await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await snooze(page, 4000);
  await dismiss(page);
  await snooze(page, 500);

  const url = page.url().replace(BASE, '');
  const title = await page.title().catch(() => '');

  const data = {
    module, screen, route, actualUrl: url, title,
    timestamp: new Date().toISOString(),
    fields: await extractFields(page),
    buttons: await extractButtons(page),
    tabs: await extractTabs(page),
    grid: await extractGrid(page),
    modals: await extractModals(page),
    validations: await extractValidations(page),
    patterns: await extractCSSPatterns(page),
  };

  // Screenshot
  const ssDir = path.join(OUT, 'screenshots');
  fs.mkdirSync(ssDir, { recursive: true });
  await page.screenshot({ path: path.join(ssDir, `${module}_${screen}.png`.replace(/[^a-z0-9_-]/gi, '_')), fullPage: true }).catch(() => {});

  // HTML dump
  const htmlDir = path.join(OUT, 'html');
  fs.mkdirSync(htmlDir, { recursive: true });
  fs.writeFileSync(path.join(htmlDir, `${module}_${screen}.html`.replace(/[^a-z0-9_-]/gi, '_')), await page.content().catch(() => ''));

  console.log(`   📋 campos:${data.fields.length} | 🔘 btns:${data.buttons.length} | 📑 tabs:${data.tabs.length} | 📊 grid:${data.grid.columns.length}cols×${data.grid.rows}rows | ⚡ msgs:${data.validations.length}`);

  return data;
}

// ─── CRITICAL SCREENS ──────────────────────────────────────

const SCREENS = [
  // Compras (5)
  ['Compras', 'GestionProveedores', '/compras/tabla/gestion-proveedores'],
  ['Compras', 'GenerarOC', '/compras/operaciones/ordenes-compra'],
  ['Compras', 'AprobarOC', '/compras/operaciones/aprobar-compra'],
  ['Compras', 'RegistroComprobantes', '/compras/operaciones/facturas-proveedores'],
  ['Compras', 'GestionCompras', '/compras/reportes/gestion-compras'],

  // Finanzas — críticas (7)
  ['Finanzas', 'TiposDocumento', '/finanzas/tabla/tipos-documento'],
  ['Finanzas', 'ConceptosFinancieros', '/finanzas/tabla/conceptos-financieros'],
  ['Finanzas', 'CarteraPagos', '/finanzas/tesoreria/cartera-pagos'],
  ['Finanzas', 'CarteraCobros', '/finanzas/tesoreria/carteras-cobros'],
  ['Finanzas', 'CuentaBancaria', '/finanzas/tabla/cuenta-bancaria'],
  ['Finanzas', 'OrdenesGiro', '/finanzas/adelantos/ordenes-giro'],
  ['Finanzas', 'RendicionGastos', '/finanzas/adelantos/rendicion-gastos'],

  // Contabilidad (3)
  ['Contabilidad', 'PlanContable', '/contabilidad/tabla/plan-contable'],
  ['Contabilidad', 'CentrosCosto', '/contabilidad/tabla/plan-centro-costo'],
  ['Contabilidad', 'TipoCambio', '/contabilidad/tabla/tipo-de-cambio'],

  // AF — críticas (4)
  ['ActivosFijos', 'MaestroAF', '/activos/operaciones/registroactivos'],
  ['ActivosFijos', 'OperacionesTabla', '/activos/tabla/operaciones'],
  ['ActivosFijos', 'VentaActivos', '/activos/operaciones/venta-activos'],
  ['ActivosFijos', 'CalculoDepreciacion', '/activos/procesos/calculo-depreciacion'],

  // RRHH — críticas (5)
  ['RRHH', 'DatosPersonales', '/rrhh/maestro-personal/datos-contacto'],
  ['RRHH', 'Cargos', '/rrhh/maestro-personal/definicion-cargos'],
  ['RRHH', 'TipoContrato', '/rrhh/parametros/tipo-contrato'],
  ['RRHH', 'CalculoPlanilla', '/rrhh/procesos-de-nomina/calculo-planillas'],
  ['RRHH', 'RegistrarLiquidacion', '/rrhh/procesos-de-nomina/registrar-liquidacion'],
];

// ─── TEST ──────────────────────────────────────────────────

test.describe('🔬 FASE 4 — Descubrimiento Técnico', () => {

  test('Deep scout de pantallas críticas', async ({ page }) => {
    test.setTimeout(600000);
    fs.mkdirSync(OUT, { recursive: true });

    // Login
    await page.goto(BASE + '/auth/signin', { waitUntil: 'networkidle', timeout: 60000 });
    await snooze(page, 3000);
    await page.locator('input[placeholder="usuario@empresa.com"]').fill('pcastillo');
    await page.locator('input[placeholder="**********"]').fill('Julienzoe1429*');
    await page.locator('ion-button.button-login').click();
    await snooze(page, 5000);
    for (const row of await page.locator('tr.cursor-pointer').all()) {
      if ((await row.textContent())?.toLowerCase().includes('pesquera')) { await row.click(); break; }
    }
    await snooze(page, 3000);
    for (const row of await page.locator('tr.cursor-pointer').all()) {
      if ((await row.textContent())?.toLowerCase().includes('lima')) { await row.click(); break; }
    }
    await page.waitForURL(/\/inicio/, { timeout: 20000 }).catch(() => {});
    await snooze(page, 3000);
    console.log('✅ Login\n');

    const allData = {};
    for (const [mod, scr, route] of SCREENS) {
      const data = await scoutScreen(page, mod, scr, route);
      allData[`${mod}_${scr}`] = data;

      // Save per-screen JSON
      const screenFile = path.join(OUT, `${mod}_${scr}.json`);
      fs.writeFileSync(screenFile, JSON.stringify(data, null, 2));
    }

    // Save consolidated
    fs.writeFileSync(path.join(OUT, 'inventario-tecnico-completo.json'), JSON.stringify(allData, null, 2));

    // ── Generate summary Markdown ──
    let md = `# INVENTARIO TÉCNICO PARA AUTOMATIZACIÓN — RestPE Contabilidad\n\n> **Fecha:** ${new Date().toISOString().split('T')[0]}\n> **Pantallas analizadas:** ${Object.keys(allData).length}\n\n---\n\n## Resumen por Pantalla\n\n| Pantalla | Campos | Botones | Tabs | Grid Cols | Grid Rows | Mensajes |\n|:---------|:------:|:-------:|:----:|:---------:|:---------:|:--------:|\n`;
    for (const [key, d] of Object.entries(allData)) {
      md += `| ${d.screen} | ${d.fields.length} | ${d.buttons.length} | ${d.tabs.length} | ${d.grid.columns.length} | ${d.grid.rows} | ${d.validations.length} |\n`;
    }

    // ── INVENTARIO_CAMPOS ──
    md += `\n---\n\n## INVENTARIO DE CAMPOS\n\n`;
    for (const [key, d] of Object.entries(allData)) {
      if (d.fields.length === 0) continue;
      md += `### ${d.module} > ${d.screen}\n\n`;
      md += `| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |\n`;
      md += `|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|\n`;
      for (const f of d.fields) {
        md += `| ${f.tag} | \`${f.formControlName}\` | ${f.label} | ${f.type} | ${f.placeholder} | ${f.disabled ? '✅' : '❌'} | ${f.readonly ? '✅' : '❌'} | ${f.required ? '✅' : '❌'} | \`${f.selector}\` | ${f.stability} |\n`;
      }
      md += `\n`;
    }

    // ── INVENTARIO_TABLAS ──
    md += `\n---\n\n## INVENTARIO DE TABLAS\n\n`;
    for (const [key, d] of Object.entries(allData)) {
      if (d.grid.columns.length === 0) continue;
      md += `### ${d.module} > ${d.screen}\n\n`;
      md += `**Filas:** ${d.grid.rows} | **Export:** ${d.grid.features.export} | **Paginación:** ${d.grid.features.pagination} | **Filtros:** ${d.grid.features.filters} | **Selección:** ${d.grid.features.selection}\n\n`;
      md += `| # | Columna | Ordenable |\n`;
      md += `|:-:|:--------|:---------:|\n`;
      for (const c of d.grid.columns) {
        md += `| ${c.index} | ${c.name} | ${c.sortable ? '✅' : '❌'} |\n`;
      }
      if (d.grid.rowActions.length > 0) {
        md += `\n**Acciones por fila:** ${d.grid.rowActions.map(a => a.text || a.icon).join(', ')}\n`;
      }
      md += `\n`;
    }

    // ── INVENTARIO_TABS ──
    md += `\n---\n\n## INVENTARIO DE TABS\n\n`;
    for (const [key, d] of Object.entries(allData)) {
      if (d.tabs.length === 0) continue;
      md += `### ${d.module} > ${d.screen}\n\n`;
      md += `| # | Nombre | Seleccionado | Selector |\n`;
      md += `|:-:|:-------|:------------:|:---------|\n`;
      for (const t of d.tabs) {
        md += `| ${t.index} | ${t.name} | ${t.selected ? '✅' : ''} | \`${t.selector}\` |\n`;
      }
      md += `\n`;
    }

    // ── COMPONENTES_REUTILIZABLES ──
    md += `\n---\n\n## COMPONENTES REUTILIZABLES\n\n`;
    const allPatterns = new Map();
    for (const [key, d] of Object.entries(allData)) {
      for (const [name, info] of Object.entries(d.patterns)) {
        if (!allPatterns.has(name)) allPatterns.set(name, { ...info, screens: [] });
        allPatterns.get(name).screens.push(d.screen);
      }
    }
    for (const [name, info] of allPatterns.entries()) {
      md += `### \`${name}\`\n`;
      md += `- **Tipo:** ${info.type}\n`;
      md += `- **Descripción:** ${info.desc}\n`;
      md += `- **Usado en:** ${info.screens.join(', ')}\n\n`;
    }

    // ── INVENTARIO_BOTONES ──
    md += `\n---\n\n## INVENTARIO DE BOTONES\n\n`;
    for (const [key, d] of Object.entries(allData)) {
      if (d.buttons.length === 0) continue;
      md += `### ${d.module} > ${d.screen}\n\n`;
      md += `| Texto | Type | Disabled | Color | Icon | Selector |\n`;
      md += `|:------|:-----|:--------:|:------|:----:|:---------|\n`;
      for (const b of d.buttons) {
        md += `| ${b.text} | ${b.type} | ${b.disabled ? '✅' : '❌'} | ${b.color} | ${b.hasIcon ? '✅' : ''} | \`${b.selector}\` |\n`;
      }
      md += `\n`;
    }

    fs.writeFileSync(path.join(OUT, 'INVENTARIO_TECNICO.md'), md);
    console.log(`\n📦 ${Object.keys(allData).length} archivos JSON + INVENTARIO_TECNICO.md generados en ${OUT}`);
  });
});
