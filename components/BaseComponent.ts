import type { Page } from '@playwright/test';

/**
 * Clase base para componentes reutilizables (AgGrid, Tabs, Modales).
 * Provee acceso a la página y un contenedor opcional.
 */
export abstract class BaseComponent {
  protected readonly page: Page;
  protected readonly container?: string;

  constructor(page: Page, containerSelector?: string) {
    this.page = page;
    this.container = containerSelector;
  }

  /** Selector raíz del componente. Override en subclase. */
  protected abstract get rootSelector(): string;

  /** Verifica si el componente está visible en la página. */
  async isVisible(): Promise<boolean> {
    try {
      return await this.page.locator(this.rootSelector).first().isVisible();
    } catch {
      return false;
    }
  }

  /** Espera hasta que el componente esté visible. */
  async waitForVisible(timeout = 10_000): Promise<void> {
    await this.page.locator(this.rootSelector).first().waitFor({ state: 'visible', timeout });
  }
}
