const { test } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const OUT = path.resolve(__dirname, '..', '..', 'exploracion-output', 'tecnico-profundo');
const BASE = 'https://panel.dev.contabilidad.restaurant.pe';

async function snooze(p, ms) { await p.waitForTimeout(ms); }
async function dismiss(p) {
  await p.evaluate(() => { const el = document.querySelector('.filtros-absolutos'); if (el) el.style.display = 'none'; }).catch(() => {});
}

// ─── DEEP FIELD EXTRACTOR ───────────────────────────────────
async function scanFields(page) {
  const fields = [];
  for (const el of await page.locator('ion-input:visible').all()) {
    const fc = await el.getAttribute('formcontrolname').catch(() => '');
    const inp = el.locator('input');
    const t = await inp.getAttribute('type').catch(() => 'text');
    const ph = await inp.getAttribute('placeholder').catch(() => '');
    const dis = await inp.isDisabled().catch(() => false);
    const ro = (await inp.getAttribute('readonly').catch(() => null)) !== null;
    const req = (await inp.getAttribute('required').catch(() => null)) !== null;
    const maxl = await inp.getAttribute('maxlength').catch(() => '');
    const val = await inp.inputValue().catch(() => '');
    const sel = fc ? `ion-input[formcontrolname="${fc}"] input` : (ph ? `input[placeholder="${ph}"]` : '');
    fields.push({ el:'ion-input', fc, ph, type:t, disabled:dis, readonly:ro, required:req, maxlength:maxl, value:val, selector:sel, stability:fc?'ALTA':(ph?'MEDIA':'BAJA') });
  }
  for (const el of await page.locator('ion-textarea:visible').all()) {
    const fc = await el.getAttribute('formcontrolname').catch(() => '');
    const ph = await el.getAttribute('placeholder').catch(() => '');
    const dis = await el.isDisabled().catch(() => false);
    fields.push({ el:'ion-textarea', fc, ph, disabled:dis, selector:fc?`ion-textarea[formcontrolname="${fc}"] textarea`:'', stability:fc?'ALTA':'BAJA' });
  }
  for (const el of await page.locator('ion-select:visible').all()) {
    const fc = await el.getAttribute('formcontrolname').catch(() => '');
    const ph = await el.getAttribute('placeholder').catch(() => '');
    const dis = await el.isDisabled().catch(() => false);
    const val = await el.getAttribute('value').catch(() => '') || '';
    fields.push({ el:'ion-select', fc, ph, disabled:dis, value:val, options:[], selector:fc?`ion-select[formcontrolname="${fc}"]`:'', stability:fc?'ALTA':'BAJA' });
  }
  for (const el of await page.locator('ion-checkbox:visible').all()) {
    const fc = await el.getAttribute('formcontrolname').catch(() => '');
    const chk = await el.getAttribute('checked').catch(() => null) !== null;
    fields.push({ el:'ion-checkbox', fc, checked:chk, selector:fc?`ion-checkbox[formcontrolname="${fc}"]`:'', stability:fc?'ALTA':'BAJA' });
  }
  return fields;
}

// ─── DEEP SELECT OPENER ────────────────────────────────────
async function openSelects(page) {
  const selects = await page.locator('ion-select:visible:not([disabled])').all();
  for (const s of selects) {
    try {
      await s.click({ timeout: 3000 });
      await snooze(page, 800);
      const opts = await page.locator('ion-alert button:visible, .alert-radio-label:visible, ion-select-popover button:visible, .select-interface-option:visible, ion-action-sheet button:visible').all();
      const opts2 = await page.locator('ion-alert [role="radio"]:visible, ion-alert .alert-button:visible').all();
      const allOpts = opts.length > 0 ? opts : (opts2.length > 0 ? opts2 : []);
      const texts = [];
      for (const o of allOpts) {
        const t = (await o.textContent().catch(() => ''))?.trim();
        if (t && !texts.includes(t)) texts.push(t);
      }
      const fc = await s.getAttribute('formcontrolname').catch(() => '');
      if (texts.length > 0) console.log(`      📋 Select[${fc}]: ${texts.join(' | ')}`); else console.log(`      ⚠️ Select[${fc}]: NO OPTIONS CAPTURED`);
    } catch (e) {}
    // Force dismiss any overlays left open
    await page.evaluate(() => { document.querySelectorAll('ion-popover, ion-alert, ion-action-sheet, ion-modal').forEach(el => el.remove()); }).catch(() => {});
    await snooze(page, 300);
  }
}

// ─── TAB WALKER ────────────────────────────────────────────
async function walkTabs(page) {
  const results = {};
  const tabs = await page.locator('ion-segment-button:visible, [role="tab"]:visible, ion-tab-button:visible').all();
  if (tabs.length === 0) return results;

  const firstTab = tabs[0];
  const firstText = (await firstTab.textContent().catch(() => ''))?.trim();
  // Click first tab to start
  if (firstText) { try { await firstTab.click({ force: true, timeout: 5000 }); } catch(e) {} await snooze(page, 1500); await dismiss(page); }

  for (let i = 0; i < tabs.length; i++) {
    const t = tabs[i];
    const name = (await t.textContent().catch(() => ''))?.trim();
    if (!name) continue;

    console.log(`   📑 Tab [${i}]: ${name}`);
    try { await t.click({ force: true, timeout: 5000 }); } catch (e) { console.log(`      ⚠️ Tab click failed`); continue; }
    await snooze(page, 2000);
    await dismiss(page);
    await snooze(page, 500);

    const fields = await scanFields(page);
    const btns = [];
    for (const b of await page.locator('button:visible, ion-button:visible').all()) {
      const txt = (await b.textContent().catch(() => ''))?.trim();
      const dis = await b.isDisabled().catch(() => false);
      if (txt) btns.push({ text: txt.substring(0, 80), disabled: dis });
    }
    const cols = [];
    for (const h of await page.locator('.ag-header-cell-text:visible, th:visible').all()) {
      const c = (await h.textContent().catch(() => ''))?.trim();
      if (c) cols.push(c);
    }
    const rows = await page.locator('.ag-row:visible').count().catch(() => 0);

    results[name] = { tabIndex: i, fields, buttons: btns, gridCols: cols, gridRows: rows };
    console.log(`      campos:${fields.length} btns:${btns.length} cols:${cols.length} rows:${rows}`);
  }
  return results;
}

// ─── GRID ROW ACTIONS ──────────────────────────────────────
async function scanGridActions(page) {
  const result = { rowActions: [], features: {} };
  await page.evaluate(() => { document.querySelectorAll('ion-popover, ion-alert, ion-action-sheet, ion-modal, ion-backdrop').forEach(el => el.remove()); }).catch(() => {});
  await dismiss(page);
  await snooze(page, 500);

  // Click first row to see if side-panel opens
  const firstRow = page.locator('.ag-row:visible').first();
  try {
    if (await firstRow.count().catch(() => 0) > 0) {
      await firstRow.click({ timeout: 5000 });
      await snooze(page, 1500);
      await dismiss(page);
    }
  } catch (e) { console.log(`      ⚠️ Grid click blocked: ${e.message?.substring(0, 80)}`); }

  // Now look for action buttons that appeared (edit, delete, etc.)
  const actionBtns = await page.locator('button:visible, ion-button:visible').all();
  for (const b of actionBtns) {
    const txt = (await b.textContent().catch(() => ''))?.trim();
    const dis = await b.isDisabled().catch(() => false);
    if (txt && txt.length < 30) result.rowActions.push({ text: txt, disabled: dis });
  }

  // Export buttons
  result.features.exportExcel = await page.locator('button:has-text("Excel"), ion-button:has-text("Excel")').count().catch(() => 0);
  result.features.exportPDF = await page.locator('button:has-text("PDF"), ion-button:has-text("PDF")').count().catch(() => 0);
  result.features.pagination = await page.locator('.ag-paging-panel, .ag-paging-button').count().catch(() => 0) > 0;
  result.features.columnFilters = await page.locator('.ag-floating-filter-input input').count().catch(() => 0);
  result.features.checkboxSelection = await page.locator('.ag-checkbox:visible').count().catch(() => 0);

  return result;
}

// ─── VALIDATION TRIGGER ────────────────────────────────────
async function triggerValidations(page) {
  const msgs = [];
  // Try clicking save to trigger validations
  const saveBtn = page.locator('button:has-text("Registrar"):not([disabled]), button:has-text("Guardar"):not([disabled]), ion-button:has-text("Registrar"):not([aria-disabled="true"]), ion-button:has-text("Guardar"):not([aria-disabled="true"])').first();
  let clicked = false;
  try {
    if (await saveBtn.count().catch(() => 0) > 0) {
      await saveBtn.click({ timeout: 3000, force: true });
      await snooze(page, 2000);
      clicked = true;
    }
  } catch (e) { /* button not clickable */ }

  // Capture validation messages
  for (const el of await page.locator('ion-text[color="danger"]:visible, .error-message:visible, [role="alert"]:visible, .validation-text:visible, .ng-invalid.ng-touched:visible').all()) {
    const txt = (await el.textContent().catch(() => ''))?.trim();
    if (txt) msgs.push({ text: txt, type: 'validation' });
  }

  // Capture toast
  const toasts = await page.locator('ion-toast:visible').all();
  for (const t of toasts) {
    const msg = await t.locator('.toast-message, .toast-content').textContent().catch(() => '');
    if (msg) msgs.push({ text: msg.trim(), type: 'toast' });
  }

  // Also check for a "faltan datos" panel
  const panel = await page.locator('text=Faltan, ion-item:has-text("requerido"), .required-error:visible').all();
  for (const p of panel) {
    const txt = (await p.textContent().catch(() => ''))?.trim();
    if (txt) msgs.push({ text: txt, type: 'validation-panel' });
  }

  if (clicked) {
    // Press escape or click cancel to dismiss any changes
    await page.keyboard.press('Escape');
    await snooze(page, 500);
  }

  return msgs;
}

// ─── MODAL OPENER ──────────────────────────────────────────
async function openModals(page) {
  const modals = [];
  const modalTriggers = await page.locator('button:has-text("Nuevo"), button:has-text("Agregar"), button:has-text("Importar"), ion-button:has-text("Nuevo"), ion-button:has-text("Agregar")').all();
  for (const btn of modalTriggers) {
    try {
      const txt = (await btn.textContent().catch(() => ''))?.trim();
      const visible = await btn.isVisible().catch(() => false);
      const dis = await btn.isDisabled().catch(() => true);
      if (!visible || dis || !txt) continue;
      try { await btn.click({ timeout: 3000 }); } catch (e) { continue; }
      await snooze(page, 1500);
      const modal = page.locator('ion-modal:visible, [role="dialog"]:visible, .modal-overlay:visible').first();
      if (await modal.count().catch(() => 0) > 0) {
        const title = await modal.locator('ion-title, h2, h3, [class*="title"]').first().textContent().catch(() => '');
        const fcnt = (await modal.locator('ion-input:visible, ion-select:visible, input:visible:not([type=hidden])').count().catch(() => 0));
        const bts = [];
        for (const b of await modal.locator('button:visible, ion-button:visible').all()) {
          const t = (await b.textContent().catch(() => ''))?.trim();
          if (t) bts.push(t.substring(0, 60));
        }
        modals.push({ trigger: txt, title: title?.trim() || '', fieldCount: fcnt, buttons: bts });
        console.log(`      🪟 Modal "${txt}": ${fcnt} campos, ${bts.length} botones`);
      }
    } catch (e) { /* skip modal errors */ }
    // Clean up any lingering overlays
    await page.evaluate(() => { document.querySelectorAll('ion-popover, ion-alert, ion-action-sheet, ion-modal, ion-backdrop').forEach(el => el.remove()); }).catch(() => {});
    await snooze(page, 300);
  }
  return modals;
}

// ─── NAVIGATION VERIFIER ────────────────────────────────────
async function verifyNavigation(page, module, screen) {
  const nav = { navigatedAway: false, targetUrl: '' };
  // Click the first non-disabled navigation-like button
  const navBtns = await page.locator('a:visible[href], button:visible[routerlink]').all();
  // Just record that navigation elements exist
  nav.hasLinks = navBtns.length > 0;
  return nav;
}

// ─── MAIN DEEP SCOUT ──────────────────────────────────────

async function deepScout(page, module, screen, route) {
  console.log(`\n═══════════════════════════════════════════`);
  console.log(`🔬 DEEP: ${module} > ${screen}`);
  console.log(`═══════════════════════════════════════════`);

  await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await snooze(page, 4000);
  await dismiss(page);
  await snooze(page, 500);

  const data = {
    module, screen, route, actualUrl: page.url().replace(BASE, ''),
    initialFields: await scanFields(page),
    tabs: {},
    selects: [],
    grid: {},
    modals: [],
    validations: [],
    navigation: {},
  };

  // 1. Tabs
  console.log('   📑 Recorriendo tabs...');
  data.tabs = await walkTabs(page);
  // Return to first tab
  const firstT = page.locator('ion-segment-button:visible, [role="tab"]:visible').first();
  if (await firstT.count().catch(() => 0) > 0) { await firstT.click(); await snooze(page, 1500); }

  // 2. Selects
  console.log('   📋 Abriendo selects...');
  await openSelects(page);

  // 3. Grid actions
  console.log('   📊 Escaneando grid...');
  data.grid = await scanGridActions(page);

  // 4. Modals
  console.log('   🪟 Abriendo modales...');
  data.modals = await openModals(page);

  // 5. Validations
  console.log('   ⚡ Provocando validaciones...');
  data.validations = await triggerValidations(page);
  if (data.validations.length > 0) {
    data.validations.forEach(v => console.log(`      ${v.type}: ${v.text.substring(0, 100)}`));
  }

  // 6. Navigation
  data.navigation = await verifyNavigation(page, module, screen);

  // Save
  const dir = path.join(OUT, module);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${screen}.json`), JSON.stringify(data, null, 2));
  fs.writeFileSync(path.join(dir, `${screen}_DOM.html`), await page.content().catch(() => ''));

  console.log(`   💾 Guardado: ${dir}/${screen}.json`);
  return data;
}

// ─── PRIORITY SCREENS ──────────────────────────────────────

const SCREENS = [
  ['Compras', 'GestionProveedores', '/compras/tabla/gestion-proveedores'],
  ['Compras', 'GenerarOC', '/compras/operaciones/ordenes-compra'],
  ['Compras', 'RegistroComprobantes', '/compras/operaciones/facturas-proveedores'],
  ['ActivosFijos', 'MaestroAF', '/activos/operaciones/registroactivos'],
  ['RRHH', 'DatosPersonales', '/rrhh/maestro-personal/datos-contacto'],
  ['RRHH', 'RegistrarLiquidacion', '/rrhh/procesos-de-nomina/registrar-liquidacion'],
  ['Finanzas', 'CarteraPagos', '/finanzas/tesoreria/cartera-pagos'],
  ['RRHH', 'CalculoPlanilla', '/rrhh/procesos-de-nomina/calculo-planillas'],
];

test.describe('🔬 FASE 4 — Deep Technical Scout', () => {
  test('Análisis profundo de pantallas críticas', async ({ page }) => {
    test.setTimeout(600000);
    fs.mkdirSync(OUT, { recursive: true });

    // Login
    await page.goto(BASE + '/auth/signin', { waitUntil: 'networkidle', timeout: 60000 });
    await snooze(page, 3000);
    await page.locator('input[placeholder="usuario@empresa.com"]').fill('pcastillo');
    await page.locator('input[placeholder="**********"]').fill('Julienzoe1429*');
    await page.locator('ion-button.button-login').click();
    await snooze(page, 5000);
    for (const row of await page.locator('tr.cursor-pointer').all()) { const t = await row.textContent(); if (t?.toLowerCase().includes('pesquera')) { await row.click(); break; } }
    await snooze(page, 3000);
    for (const row of await page.locator('tr.cursor-pointer').all()) { const t = await row.textContent(); if (t?.toLowerCase().includes('lima')) { await row.click(); break; } }
    await page.waitForURL(/\/inicio/, { timeout: 20000 }).catch(() => {});
    await snooze(page, 3000);
    console.log('✅ Login\n');

    const results = {};
    for (const [mod, scr, route] of SCREENS) {
      try {
        results[`${mod}_${scr}`] = await deepScout(page, mod, scr, route);
      } catch (e) {
        console.log(`   ❌ ERROR: ${e.message?.substring(0, 100)}`);
        results[`${mod}_${scr}`] = { module: mod, screen: scr, route, error: e.message };
      }
    }

    // ── Generate summary report ──
    let report = `# INFORME TÉCNICO PROFUNDO — Pantallas Críticas\n\n> Fecha: ${new Date().toISOString().split('T')[0]}\n> Pantallas analizadas: ${Object.keys(results).length}\n\n---\n\n## Resumen\n\n| Pantalla | Tabs | Campos iniciales | Grid cols | Grid rows | Modales | Validaciones |\n|:---------|:----:|:----------------:|:---------:|:---------:|:-------:|:------------:|\n`;
    for (const [k, d] of Object.entries(results)) {
      report += `| ${d.screen} | ${Object.keys(d.tabs).length} | ${d.initialFields.length} | ${d.grid.rowActions?.length || 0} acciones | — | ${d.modals.length} | ${d.validations.length} |\n`;
    }
    report += `\n---\n\n## Detalle por Pantalla\n\n`;
    for (const [k, d] of Object.entries(results)) {
      report += `### ${d.module} > ${d.screen}\n\n`;
      report += `**URL:** \`${d.route}\` → \`${d.actualUrl}\`\n\n`;

      if (Object.keys(d.tabs).length > 0) {
        report += `**Tabs:** ` + Object.keys(d.tabs).join(' | ') + `\n\n`;
        report += `| Tab | Campos | Botones | Grid Cols | Grid Rows |\n`;
        report += `|:----|:------:|:-------:|:---------:|:---------:|\n`;
        for (const [name, td] of Object.entries(d.tabs)) {
          report += `| ${name} | ${td.fields.length} | ${td.buttons.length} | ${td.gridCols.length} | ${td.gridRows} |\n`;
        }
        report += `\n`;
      }

      if (d.validations.length > 0) {
        report += `**Validaciones capturadas:**\n`;
        d.validations.forEach(v => report += `- [${v.type}] ${v.text}\n`);
        report += `\n`;
      }

      if (d.modals.length > 0) {
        report += `**Modales abiertos:**\n`;
        d.modals.forEach(m => report += `- "${m.trigger}" → "${m.title}" (${m.fields} campos, ${m.buttons.length} botones)\n`);
        report += `\n`;
      }

      report += `**Grid:**\n`;
      report += `- Export Excel: ${d.grid.features?.exportExcel ? '✅' : '❌'} | Export PDF: ${d.grid.features?.exportPDF ? '✅' : '❌'}\n`;
      report += `- Paginación: ${d.grid.features?.pagination ? '✅' : '❌'} | Filtros columna: ${d.grid.features?.columnFilters ? '✅' : '❌'} | Checkbox: ${d.grid.features?.checkboxSelection ? '✅' : '❌'}\n`;
      if (d.grid.rowActions?.length > 0) report += `- Acciones detectadas: ${d.grid.rowActions.map(a => a.text).join(', ')}\n`;
      report += `\n`;
    }

    report += `---\n\n## Veredicto Final\n\n`;
    const totalTabs = Object.values(results).reduce((s, d) => s + Object.keys(d.tabs).length, 0);
    const totalFields = Object.values(results).reduce((s, d) => s + d.initialFields.length, 0);
    const totalModals = Object.values(results).reduce((s, d) => s + d.modals.length, 0);
    const totalValidations = Object.values(results).reduce((s, d) => s + d.validations.length, 0);
    report += `| Métrica | Valor |\n|:--------|:------|\n`;
    report += `| Pantallas analizadas en profundidad | ${Object.keys(results).length} |\n`;
    report += `| Tabs recorridos | ${totalTabs} |\n`;
    report += `| Campos documentados (con selector) | ${totalFields} |\n`;
    report += `| Modales abiertos | ${totalModals} |\n`;
    report += `| Validaciones capturadas | ${totalValidations} |\n`;
    report += `| Pantallas con 100% de tabs caracterizados | ${Object.values(results).filter(d => Object.keys(d.tabs).every(t => d.tabs[t].fields.length > 0)).length} |\n`;
    report += `\n${totalValidations > 0 ? '✅' : '⚠️'} **Validaciones:** ${totalValidations > 0 ? 'Se capturaron mensajes de validación reales' : 'No se detectaron validaciones — posiblemente los formularios requieren datos específicos para dispararlas'}\n`;
    report += `\n${totalModals > 0 ? '✅' : '⚠️'} **Modales:** ${totalModals > 0 ? 'Se abrieron y documentaron modales' : 'No se encontraron modales activables'}\n`;

    fs.writeFileSync(path.join(OUT, 'INFORME_TECNICO_PROFUNDO.md'), report);
    console.log(`\n📦 Reporte: ${OUT}/INFORME_TECNICO_PROFUNDO.md`);
  });
});
