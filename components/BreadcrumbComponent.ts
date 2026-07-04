import { BaseComponent } from '@components/BaseComponent';
import type { Page } from '@playwright/test';

/**
 * Abstracción del breadcrumb de navegación.
 *
 * @example
 * const bc = new BreadcrumbComponent(page);
 * const ruta = await bc.getPath();
 * await bc.navigateTo('Compras');
 */
export class BreadcrumbComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  protected get rootSelector(): string {
    return 'app-breadcrumb, [class*="breadcrumb"], nav[aria-label="Breadcrumb"]';
  }

  /** Obtiene la ruta actual como array de textos del breadcrumb. */
  async getPath(): Promise<string[]> {
    const items = await this.page.locator(`${this.rootSelector} li, ${this.rootSelector} a, ${this.rootSelector} span`).all();
    const path: string[] = [];
    for (const item of items) {
      const text = (await item.textContent())?.trim();
      if (text && !text.includes('›') && !text.includes('/')) {
        path.push(text);
      }
    }
    return path;
  }

  /** Navega a un nivel del breadcrumb haciendo clic en él. */
  async navigateTo(label: string): Promise<void> {
    const link = this.page.locator(`${this.rootSelector} a:has-text("${label}"), ${this.rootSelector} [clickable]:has-text("${label}")`).first();
    if ((await link.count()) > 0) {
      await link.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /** Verifica que el breadcrumb contenga un texto específico. */
  async assertContains(text: string): Promise<void> {
    const path = await this.getPath();
    const found = path.some(p => p.includes(text));
    if (!found) throw new Error(`Breadcrumb no contiene "${text}". Ruta actual: ${path.join(' > ')}`);
  }

  /** Verifica que el último nivel del breadcrumb sea el esperado. */
  async assertCurrentPage(expected: string): Promise<void> {
    const path = await this.getPath();
    const last = path[path.length - 1];
    if (last !== expected) {
      throw new Error(`Breadcrumb esperaba "${expected}" como última página, pero es "${last}"`);
    }
  }
}
