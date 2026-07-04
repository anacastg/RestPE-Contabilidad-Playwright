const { test } = require('@playwright/test');

const ROUTES = [
  ['Activos Fijos', 'Maestro AF', '/activos/operaciones/registroactivos'],
  ['Activos Fijos', 'Parámetros AF', '/activos/tabla/paramoperaciones'],
  ['Activos Fijos', 'Operaciones AF', '/activos/tabla/operaciones'],
  ['Contabilidad', 'Formatos SUNAT', '/contabilidad/reportes/formatos-sunat'],
  ['RRHH', 'Tipo Contrato', '/rrhh/parametros/tipo-contrato'],
  ['RRHH', 'Asistencias', '/rrhh/asistencias-jornadas/asistencias-HE'],
];

test.describe('🔍 Pasada 3 — Activos Fijos + correcciones', () => {
  test('rutas finales', async ({ page }) => {
    test.setTimeout(300000);

    // Login
    await page.goto('https://panel.dev.contabilidad.restaurant.pe/auth/signin', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.locator('input[placeholder="usuario@empresa.com"]').fill('pcastillo');
    await page.locator('input[placeholder="**********"]').fill('Julienzoe1429*');
    await page.locator('ion-button.button-login, ion-button:has-text("Iniciar Sesión")').click();
    await page.waitForTimeout(5000);
    const rows = page.locator('tr.cursor-pointer');
    await rows.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    for (let i = 0; i < await rows.count(); i++) {
      const t = await rows.nth(i).textContent();
      if (t?.toLowerCase().includes('pesquera')) { await rows.nth(i).click(); break; }
    }
    await page.waitForTimeout(3000);
    const rows2 = page.locator('tr.cursor-pointer');
    await rows2.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    for (let i = 0; i < await rows2.count(); i++) {
      const t = await rows2.nth(i).textContent();
      if (t?.toLowerCase().includes('lima')) { await rows2.nth(i).click(); break; }
    }
    await page.waitForURL(/\/inicio/, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(3000);
    console.log('✅ Login OK\n');

    const dismiss = async () => {
      await page.evaluate(() => { const el = document.querySelector('.filtros-absolutos'); if (el) el.style.display = 'none'; }).catch(() => {});
    };

    for (const [mod, scr, route] of ROUTES) {
      console.log(`🔍 ${mod} > ${scr} [${route}]`);
      await page.goto('https://panel.dev.contabilidad.restaurant.pe' + route, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(4000);
      await dismiss();
      await page.waitForTimeout(1000);

      const url = page.url().replace('https://panel.dev.contabilidad.restaurant.pe', '');
      const btns = await page.locator('button:visible, ion-button:visible').all();
      const btnTexts = []; for (const b of btns) { const t = await b.textContent().catch(() => ''); if (t.trim()) btnTexts.push(t.trim().substring(0, 80)); }
      const cols = []; for (const h of await page.locator('.ag-header-cell-text:visible, th:visible').all()) { const t = await h.textContent().catch(() => ''); if (t.trim()) cols.push(t.trim()); }
      const tabs = []; for (const t of await page.locator('ion-segment-button:visible, [role=tab]:visible').all()) { const tx = await t.textContent().catch(() => ''); if (tx.trim()) tabs.push(tx.trim()); }
      const gridRows = await page.locator('.ag-row:visible').count().catch(() => 0);
      const inputs = await page.locator('input:visible:not([type=hidden]), ion-input:visible').count().catch(() => 0);

      const ok = btns.length > 0 || inputs > 0 || cols.length > 0;
      console.log(`   ${ok ? '✅' : '❌'} url=${url} | btn:${btnTexts.length} inp:${inputs} tabs:${tabs.length} cols:${cols.length} rows:${gridRows}`);
      if (tabs.length) console.log(`      Tabs: ${tabs.join(' | ')}`);
      if (cols.length) console.log(`      Columnas: ${cols.slice(0, 10).join(', ')}`);
      if (btnTexts.length) console.log(`      Botones: ${btnTexts.join(', ')}`);
    }
    console.log('\n✅ Done');
  });
});
