const { test, expect } = require('@playwright/test');

// ─── Config ───────────────────────────────────────────────
const CFG = {
  username: 'pcastillo',
  password: 'Julienzoe1429*',
  empresa: 'PESQUERA CANTABRIA S.A.',
  sucursal: 'LIMA',
};

// ─── Login Page ────────────────────────────────────────────
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#ion-input-0');
    this.passwordInput = page.locator('#ion-input-1');
    this.loginButton = page.locator('ion-button:has-text("Iniciar Sesión")');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
  }

  async loginAs(user, pass) {
    await this.usernameInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
    await this.page.waitForTimeout(5000);
  }

  async isVisible() {
    return this.usernameInput.isVisible().catch(() => false);
  }
}

// ─── Company Selection Page ────────────────────────────────
class CompanySelectionPage {
  constructor(page) { this.page = page; }

  async select(name) {
    const rows = this.page.locator('tr.cursor-pointer, table tbody tr');
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

// ─── Branch Selection Page ─────────────────────────────────
class BranchSelectionPage {
  constructor(page) { this.page = page; }

  async select(name) {
    const rows = this.page.locator('tr.cursor-pointer');
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

// ─── Dashboard Page ────────────────────────────────────────
class DashboardPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('text=indicadores clave');
    this.sidebar = page.locator('app-sidebar');
  }

  async waitUntilLoaded() {
    await this.page.waitForURL(/\/inicio/, { timeout: 15000 });
    await this.heading.waitFor({ state: 'visible', timeout: 15000 });
  }

  async verifySidebarModules() {
    const count = await this.sidebar.locator('a').count();
    if (count < 9) throw new Error(`Sidebar esperaba >=9 módulos, encontró ${count}`);
  }
}

// ─── Tests ─────────────────────────────────────────────────
test.describe('Smoke — Login flow', () => {

  test('@smoke @critical Login completo', async ({ page }) => {
    test.setTimeout(60000);

    const login = new LoginPage(page);
    await login.goto();
    expect(await login.isVisible()).toBeTruthy();
    await login.loginAs(CFG.username, CFG.password);

    await new CompanySelectionPage(page).select(CFG.empresa);
    await new BranchSelectionPage(page).select(CFG.sucursal);

    const dashboard = new DashboardPage(page);
    await dashboard.waitUntilLoaded();
    await dashboard.verifySidebarModules();
  });
});
