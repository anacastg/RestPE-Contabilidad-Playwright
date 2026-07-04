import { BaseComponent } from '@components/BaseComponent';
import { Logger } from '@utils/logger';
import { TIMEOUTS } from '@config/timeouts';
import type { Page } from '@playwright/test';

/**
 * Abstracción del header de la aplicación (app-header).
 * Contiene: selector de país, datos de empresa/sucursal, usuario.
 *
 * @example
 * const header = new HeaderComponent(page);
 * await header.changeCountry('Colombia');
 * const user = await header.getCurrentUser();
 */
export class HeaderComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  protected get rootSelector(): string {
    return 'app-header';
  }

  /** Obtiene el nombre del usuario actual. */
  async getCurrentUser(): Promise<string> {
    const userEl = this.page.locator('app-header [class*="user"], app-header [class*="perfil"], app-header ion-avatar').first();
    const text = (await userEl.textContent())?.trim() ?? '';
    return text;
  }

  /** Cambia el país en el selector global del header. */
  async changeCountry(pais: string): Promise<void> {
    Logger.action(`Cambiar país a "${pais}"`, true);
    const select = this.page.locator('app-header ion-select').first();
    await select.click();
    await this.page.waitForTimeout(TIMEOUTS.SELECT_POPOVER);
    const option = this.page.locator(`ion-alert button:has-text("${pais}"), .alert-radio-label:has-text("${pais}")`).first();
    await option.click();
    await this.page.waitForTimeout(2000);
  }

  /** País actualmente seleccionado. */
  async getCurrentCountry(): Promise<string> {
    const select = this.page.locator('app-header ion-select').first();
    return (await select.textContent())?.trim() ?? '';
  }

  /** Cierra sesión (si el botón existe en el header). */
  async logout(): Promise<void> {
    Logger.action('Cerrar sesión', true);
    const btn = this.page.locator('app-header button:has-text("Salir"), app-header ion-button:has-text("Cerrar sesión"), app-header [aria-label="Cerrar sesión"]').first();
    if ((await btn.count()) > 0) {
      await btn.click();
      await this.page.waitForTimeout(2000);
    }
  }

  /** Verifica que el header esté visible. */
  async assertVisible(): Promise<void> {
    const visible = await this.page.locator(this.rootSelector).isVisible();
    if (!visible) throw new Error('Header no visible');
  }
}
