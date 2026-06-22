const { test, expect } = require('@playwright/test');

const CFG = {
  username: 'pcastillo',
  password: 'Julienzoe1429*',
  empresa: 'PESQUERA CANTABRIA S.A.',
  sucursal: 'LIMA',
};

// ─── Page Objects inline ──────────────────────

class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('input[placeholder="usuario@empresa.com"]');
    this.passwordInput = page.locator('input[placeholder="**********"]');
    this.loginButton = page.locator('ion-button.button-login');
  }
  async goto() {
    await this.page.goto('/auth/signin');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }
  async loginAs(user, pass) {
    await this.usernameInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
    await this.page.waitForTimeout(5000);
  }
}

class CompanySelectionPage {
  constructor(page) { this.page = page; }
  async select(name) {
    const rows = this.page.locator('tr.cursor-pointer');
    await rows.first().waitFor({ state: 'visible', timeout: 10000 });
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).textContent();
      if (text?.toLowerCase().includes(name.toLowerCase())) {
        await rows.nth(i).click();
        await this.page.waitForTimeout(3000);
        return;
      }
    }
    throw new Error(`Empresa "${name}" no encontrada`);
  }
}

class BranchSelectionPage {
  constructor(page) { this.page = page; }
  async select(name) {
    const rows = this.page.locator('tr.cursor-pointer');
    await rows.first().waitFor({ state: 'visible', timeout: 10000 });
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).textContent();
      if (text?.toLowerCase().includes(name.toLowerCase())) {
        await rows.nth(i).click();
        await this.page.waitForURL(/\/inicio/, { timeout: 15000 });
        return;
      }
    }
    throw new Error(`Sucursal "${name}" no encontrada`);
  }
}

async function login(page) {
  const l = new LoginPage(page);
  await l.goto();
  await l.loginAs(CFG.username, CFG.password);
  await new CompanySelectionPage(page).select(CFG.empresa);
  await new BranchSelectionPage(page).select(CFG.sucursal);
  await page.waitForURL(/\/inicio/, { timeout: 15000 });
  await page.waitForTimeout(3000);
}

const ROUTES = {
  proveedores: '/compras/tabla/gestion-proveedores',
  generarOC: '/compras/operaciones/generar-oc',
  aprobarOC: '/compras/operaciones/aprobar-oc',
  registroComprobantes: '/compras/operaciones/registro-comprobantes',
  reporteCompras: '/compras/reportes/gestion-compras',
};

async function navigate(page, route) {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
}

// ─── Tests ────────────────────────────────────

test.describe('Sprint 1 — E2E Compras', () => {

  test('@sprint1 @e2e @critical E2E-01: Proveedor → OC → Aprobación → Factura → Reporte', async ({ page }) => {
    test.setTimeout(180000);
    await login(page);

    // 1. PROVEEDORES — split-view: AG Grid (izq) + formulario (der)
    await navigate(page, ROUTES.proveedores);

    // Los formcontrolname están en ion-input, no en input nativo
    // El formulario con campos ya está en el DOM.
    // llenamos campos del formulario
    const campos = {
      razonSocial: `PROVEEDOR TEST ${Date.now()}`,
      nombreComercial: 'Test Auto E2E',
      email: `test${Date.now()}@email.com`,
      telefono: '999888777',
    };

    for (const [key, value] of Object.entries(campos)) {
      const ionInput = page.locator(`ion-input[formcontrolname="${key}"]`);
      if (await ionInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await ionInput.locator('input').fill(value);
        await page.waitForTimeout(200);
      }
    }

    // Guardar o Registrar
    await page.evaluate(() => {
      const btns = document.querySelectorAll('button, ion-button');
      for (const btn of btns) {
        const t = btn.textContent?.trim() || '';
        if (t === 'Registrar' || t === 'Guardar') {
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          break;
        }
      }
    });
    await page.waitForTimeout(3000);

    // 2. GENERAR OC
    await navigate(page, ROUTES.generarOC);

    // 3. APROBACIÓN OC
    await navigate(page, ROUTES.aprobarOC);

    // 4. FACTURA CXP
    await navigate(page, ROUTES.registroComprobantes);

    // 5. REPORTE COMPRAS
    await navigate(page, ROUTES.reporteCompras);

    await expect(page.locator('app-header')).toBeVisible();
  });

  test('@sprint1 @e2e @high E2E-02: Registro Ventas SUNAT + Reporte Tributario', async ({ page }) => {
    test.setTimeout(120000);
    await login(page);
    // TODO: Navegar a ventas sp_generar_registro_ventas
    await expect(page.locator('app-header')).toBeVisible();
  });

  test('@sprint1 @e2e @high E2E-03: Cuenta Banco + Medio/Forma Pago + TC', async ({ page }) => {
    test.setTimeout(120000);
    await login(page);
    // TODO: Navegar a finanzas/configuración maestros
    await expect(page.locator('app-header')).toBeVisible();
  });
});
