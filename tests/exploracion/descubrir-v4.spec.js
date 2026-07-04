const { test } = require('@playwright/test');

const ROUTES = [
  // AF Operaciones (7 extra)
  ['Activos Fijos', 'Registro Traslado', '/activos/operaciones/registrotraslado'],
  ['Activos Fijos', 'Aprobación Traslado', '/activos/operaciones/aprobaciontraslado'],
  ['Activos Fijos', 'Recepción Traslados', '/activos/operaciones/recep-traslados'],
  ['Activos Fijos', 'Operaciones Activos', '/activos/operaciones/operacionesactivos'],
  ['Activos Fijos', 'Pólizas Seguro', '/activos/operaciones/polizasseguro'],
  ['Activos Fijos', 'Asignación Ratios', '/activos/operaciones/asignacionratios'],
  ['Activos Fijos', 'Venta Activos', '/activos/operaciones/venta-activos'],
  // AF Procesos (6)
  ['Activos Fijos', 'Cálculo Depreciación', '/activos/procesos/calculo-depreciacion'],
  ['Activos Fijos', 'Gen Asientos Depreciación', '/activos/procesos/generacion-asientos-depreciacion'],
  ['Activos Fijos', 'Gen Asientos Revaluación', '/activos/procesos/generacion-asientos-revaluacion'],
  ['Activos Fijos', 'Gen Asientos Indexación', '/activos/procesos/generacion-asientos-indexacion'],
  ['Activos Fijos', 'Gen Devengo Aseguradores', '/activos/procesos/generacion-devengo-aseguradores'],
  ['Activos Fijos', 'Gen Asientos Siniestro', '/activos/procesos/generacion-asientos-siniestro'],
  // Finanzas / Tesorería / Config
  ['Finanzas', 'Cartera Cobros', '/finanzas/tesoreria/carteras-cobros'],
  ['Finanzas', 'Cuenta Bancaria', '/finanzas/tabla/cuenta-bancaria'],
  ['Configuración', 'Medios de Pago', '/configuracion/localizacion/medios-pago'],
  ['Configuración', 'Formas de Pago', '/configuracion/localizacion/formas-pago'],
];

async function snooze(p, ms) { await p.waitForTimeout(ms); }
async function dismiss(p) { await p.evaluate(() => { const el = document.querySelector('.filtros-absolutos'); if (el) el.style.display = 'none'; }).catch(() => {}); }

test.describe('🔍 Pasada 4 — AF + Finanzas extra', () => {
  test('rutas finales', async ({ page }) => {
    test.setTimeout(300000);
    await page.goto('https://panel.dev.contabilidad.restaurant.pe/auth/signin', { waitUntil: 'networkidle', timeout: 60000 });
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

    for (const [mod, scr, route] of ROUTES) {
      console.log(`🔍 ${mod} > ${scr} [${route}]`);
      await page.goto('https://panel.dev.contabilidad.restaurant.pe' + route, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
      await snooze(page, 3000);
      await dismiss(page);
      await snooze(page, 500);
      const url = page.url().replace('https://panel.dev.contabilidad.restaurant.pe', '');
      const btn = await page.locator('button:visible, ion-button:visible').count().catch(() => 0);
      const inp = await page.locator('input:visible:not([type=hidden]), ion-input:visible').count().catch(() => 0);
      const tabs = []; for (const t of await page.locator('ion-segment-button:visible, [role=tab]:visible').all()) { const tx = await t.textContent().catch(() => ''); if (tx.trim()) tabs.push(tx.trim()); }
      const cols = []; for (const c of await page.locator('.ag-header-cell-text:visible, th:visible').all()) { const tx = await c.textContent().catch(() => ''); if (tx.trim()) cols.push(tx.trim()); }
      const rows = await page.locator('.ag-row:visible').count().catch(() => 0);
      const ok = btn > 0 || inp > 0 || cols.length > 0;
      console.log(`   ${ok ? '✅' : '❌'} url=${url} btn:${btn} inp:${inp} tabs:${tabs.length} cols:${cols.length} rows:${rows}`);
      if (tabs.length) console.log(`      Tabs: ${tabs.join(' | ')}`);
      if (cols.length) console.log(`      Cols: ${cols.slice(0, 8).join(', ')}`);
    }
    console.log('\n✅ Done');
  });
});
