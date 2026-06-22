/**
 * explore-routes.js — Mapea rutas reales del menú lateral
 *
 * Uso: node scripts/explore-routes.js
 *
 * Abre el sidebar y extrae todos los routerLink de cada módulo
 */

const { login } = require('./login-utils.js');

(async () => {
  const { browser, page } = await login({ headless: false });

  const resultados = {};

  const modulos = [
    'Almacén', 'Compras', 'Ventas', 'Finanzas',
    'Contabilidad', 'Activos fijos', 'RR.HH', 'Producción', 'Configuración',
  ];

  for (const modulo of modulos) {
    try {
      const link = page.locator(`app-sidebar a:has-text("${modulo}")`).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForTimeout(1500);
      }

      const subItems = await page.locator('app-sidebar [routerLink]').all();
      const rutas = [];
      for (const item of subItems) {
        const rl = await item.getAttribute('routerLink');
        const text = await item.textContent();
        if (rl && text?.trim()) {
          rutas.push({ ruta: rl, texto: text.trim().replace(/\s+/g, ' ') });
        }
      }
      resultados[modulo] = rutas;
      console.log(`${modulo}: ${rutas.length} rutas`);
      rutas.forEach(r => console.log(`  ${r.ruta.padEnd(55)} ${r.texto}`));
    } catch (e) {
      console.log(`${modulo}: ERROR — ${e.message}`);
    }
  }

  console.log('\n=== MAPA COMPLETO ===');
  console.log(JSON.stringify(resultados, null, 2));

  await browser.close();
})();
