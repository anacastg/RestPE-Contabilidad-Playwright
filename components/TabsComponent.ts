import { BaseComponent } from '@components/BaseComponent';
import { Logger } from '@utils/logger';
import { TIMEOUTS } from '@config/timeouts';
import { dismissOverlay } from '@utils/helpers';
import type { Page } from '@playwright/test';

/**
 * Abstracción de tabs (ion-segment-button) de Ionic.
 *
 * @example
 * const tabs = new TabsComponent(page);
 * await tabs.switchTo('Bancaria');
 * const active = await tabs.getActiveTab();
 */
export class TabsComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  protected get rootSelector(): string {
    return 'ion-segment-button:visible, [role="tab"]:visible';
  }

  /** Obtiene los nombres de todos los tabs visibles. */
  async getTabNames(): Promise<string[]> {
    const els = await this.page.locator(this.rootSelector).all();
    const names: string[] = [];
    for (const el of els) {
      const text = (await el.textContent())?.trim();
      if (text) names.push(text);
    }
    return names;
  }

  /** Cambia al tab con el nombre dado. */
  async switchTo(tabName: string): Promise<void> {
    Logger.action(`Cambiar a tab "${tabName}"`, true);
    const tab = this.page.locator(`ion-segment-button:has-text("${tabName}"), [role="tab"]:has-text("${tabName}")`).first();
    await tab.waitFor({ state: 'visible', timeout: TIMEOUTS.ACCION_RAPIDA });
    await tab.click({ force: true });
    await this.page.waitForTimeout(TIMEOUTS.TAB_CHANGE);
    await dismissOverlay(this.page);
  }

  /** Nombre del tab actualmente activo. */
  async getActiveTab(): Promise<string> {
    const tabs = await this.page.locator(this.rootSelector).all();
    for (const tab of tabs) {
      const selected = (await tab.getAttribute('aria-selected')) === 'true'
        || (await tab.getAttribute('checked')) !== null;
      if (selected) {
        return (await tab.textContent())?.trim() ?? '';
      }
    }
    return '';
  }

  /** Verifica que un tab específico esté activo. */
  async assertActive(tabName: string): Promise<void> {
    const active = await this.getActiveTab();
    if (active !== tabName) {
      throw new Error(`Se esperaba tab "${tabName}" activo, pero está activo "${active}"`);
    }
  }

  /** Número de tabs visibles. */
  async getCount(): Promise<number> {
    return this.page.locator(this.rootSelector).count();
  }

  /** Ejecuta un callback dentro de un tab específico, volviendo al original al terminar. */
  async withTab<T>(tabName: string, callback: () => Promise<T>): Promise<T> {
    const original = await this.getActiveTab();
    await this.switchTo(tabName);
    try {
      return await callback();
    } finally {
      if (original && original !== tabName) {
        await this.switchTo(original);
      }
    }
  }
}
