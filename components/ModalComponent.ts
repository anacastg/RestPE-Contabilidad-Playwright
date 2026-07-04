import { BaseComponent } from '@components/BaseComponent';
import { Logger } from '@utils/logger';
import { TIMEOUTS } from '@config/timeouts';
import type { Page } from '@playwright/test';

/**
 * Abstracción de modales (ion-modal) de Ionic.
 *
 * @example
 * const modal = new ModalComponent(page);
 * await modal.open('Nuevo producto');
 * await modal.confirm();
 */
export class ModalComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  protected get rootSelector(): string {
    return 'ion-modal:visible, [role="dialog"]:visible';
  }

  /** Abre un modal haciendo clic en el botón trigger. */
  async open(triggerButtonText: string): Promise<void> {
    Logger.action(`Abrir modal vía "${triggerButtonText}"`, true);
    const btn = this.page.locator(
      `button:has-text("${triggerButtonText}"), ion-button:has-text("${triggerButtonText}")`,
    ).first();
    await btn.waitFor({ state: 'visible', timeout: TIMEOUTS.ACCION_RAPIDA });
    await btn.click();
    await this.page.waitForTimeout(TIMEOUTS.MODAL);
  }

  /** Cierra el modal presionando Escape. */
  async close(): Promise<void> {
    Logger.action('Cerrar modal', true);
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
  }

  /** Hace clic en el botón Cancelar del modal. */
  async cancel(): Promise<void> {
    Logger.action('Cancelar modal', true);
    const btn = this.page.locator(this.rootSelector).locator(
      'button:has-text("Cancelar"), ion-button:has-text("Cancelar")',
    ).first();
    await btn.click();
    await this.page.waitForTimeout(500);
  }

  /** Hace clic en el botón Guardar/Confirmar/Aceptar del modal. */
  async confirm(): Promise<void> {
    Logger.action('Confirmar modal', true);
    const btn = this.page.locator(this.rootSelector).locator(
      'button:has-text("Guardar"), ion-button:has-text("Guardar"), button:has-text("Aceptar"), ion-button:has-text("Aceptar"), button:has-text("Agregar"), ion-button:has-text("Agregar")',
    ).first();
    await btn.click();
    await this.page.waitForTimeout(500);
  }

  /** Título del modal. */
  async getTitle(): Promise<string> {
    const title = this.page.locator(this.rootSelector).locator('ion-title, h2, h3, [class*="title"]').first();
    return (await title.textContent())?.trim() ?? '';
  }

  /** Verifica que el modal esté visible. */
  async assertVisible(): Promise<void> {
    const visible = await this.isVisible();
    if (!visible) throw new Error('Se esperaba que el modal estuviera visible');
  }

  /** Verifica que el modal NO esté visible. */
  async assertClosed(): Promise<void> {
    const visible = await this.isVisible();
    if (visible) throw new Error('Se esperaba que el modal estuviera cerrado');
  }

  /** Espera hasta que el modal desaparezca. */
  async waitForClose(timeout = TIMEOUTS.MODAL): Promise<void> {
    await this.page.locator(this.rootSelector).waitFor({ state: 'hidden', timeout }).catch(() => {
      throw new Error(`El modal no se cerró después de ${timeout}ms`);
    });
  }

  /** Llena un campo dentro del modal. */
  async fillField(formControlName: string, value: string): Promise<void> {
    const input = this.page.locator(this.rootSelector).locator(
      `ion-input[formcontrolname="${formControlName}"] input`,
    ).first();
    await input.fill(value);
    await input.press('Tab');
    await this.page.waitForTimeout(200);
  }
}
