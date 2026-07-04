import { BaseComponent } from '@components/BaseComponent';
import { Logger } from '@utils/logger';
import { TIMEOUTS } from '@config/timeouts';
import type { Page } from '@playwright/test';

/**
 * Abstracción de notificaciones toast (ion-toast) de Ionic.
 *
 * @example
 * const toast = new ToastComponent(page);
 * await toast.waitForMessage('Relación comercial creada');
 * await toast.assertSuccess(/creada/);
 */
export class ToastComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  protected get rootSelector(): string {
    return 'ion-toast';
  }

  /** Espera que un toast aparezca con un mensaje que coincida con el patrón. */
  async waitForMessage(pattern: string | RegExp, timeout = TIMEOUTS.TOAST): Promise<string> {
    Logger.step(`Esperar toast con: ${pattern}`);
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const toast = this.page.locator('ion-toast:visible');
      if ((await toast.count()) > 0) {
        const msg = await toast.locator('.toast-message, .toast-content').textContent().catch(() => '');
        if (msg) {
          const matches = typeof pattern === 'string' ? msg.includes(pattern) : pattern.test(msg);
          if (matches) {
            Logger.action(`Toast detectado: "${msg}"`, true);
            return msg.trim();
          }
        }
      }
      await this.page.waitForTimeout(200);
    }
    throw new Error(`Toast con "${pattern}" no apareció después de ${timeout}ms`);
  }

  /** Obtiene el mensaje del toast actualmente visible. */
  async getMessage(): Promise<string> {
    const toast = this.page.locator('ion-toast:visible').first();
    return (await toast.locator('.toast-message, .toast-content').textContent())?.trim() ?? '';
  }

  /** Verifica que el toast sea de éxito. */
  async assertSuccess(pattern: string | RegExp): Promise<void> {
    const msg = await this.waitForMessage(pattern);
    if (msg.toLowerCase().includes('error') || msg.toLowerCase().includes('falló')) {
      throw new Error(`Toast parece ser de error, no de éxito: "${msg}"`);
    }
  }

  /** Verifica que el toast sea de error. */
  async assertError(pattern: string | RegExp): Promise<void> {
    const msg = await this.waitForMessage(pattern);
    Logger.action(`Toast error: "${msg}"`, true);
  }

  /** Espera que el toast desaparezca. */
  async waitForDisappear(timeout = TIMEOUTS.TOAST + 2000): Promise<void> {
    await this.page.locator('ion-toast:visible').waitFor({ state: 'hidden', timeout }).catch(() => {
      Logger.warn(`El toast no desapareció después de ${timeout}ms`);
    });
  }

  /** Verifica que NO haya ningún toast visible. */
  async assertNotVisible(): Promise<void> {
    const count = await this.page.locator('ion-toast:visible').count();
    if (count > 0) {
      const msg = await this.getMessage();
      throw new Error(`Se esperaba que no hubiera toast, pero hay uno visible: "${msg}"`);
    }
  }
}
