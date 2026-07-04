import { BaseComponent } from '@components/BaseComponent';
import { Logger } from '@utils/logger';
import { TIMEOUTS } from '@config/timeouts';
import { dismissAllOverlays } from '@utils/helpers';
import type { Page } from '@playwright/test';

/**
 * Abstracción de ion-select de Ionic.
 * Soporta selección por texto, obtención de opciones y carga dinámica.
 *
 * @example
 * const select = new IonSelectComponent(page, 'estado');
 * await select.open();
 * await select.selectByText('Activo');
 */
export class IonSelectComponent extends BaseComponent {
  private readonly formControlName: string;

  constructor(page: Page, formControlName: string) {
    super(page);
    this.formControlName = formControlName;
  }

  protected get rootSelector(): string {
    return `ion-select[formcontrolname="${this.formControlName}"]`;
  }

  /** Abre el popover/alert del select. */
  async open(): Promise<void> {
    Logger.action(`Abrir select "${this.formControlName}"`, true);
    const select = this.page.locator(this.rootSelector).first();
    await select.waitFor({ state: 'visible', timeout: TIMEOUTS.ACCION_RAPIDA });
    await select.click();
    await this.page.waitForTimeout(TIMEOUTS.SELECT_POPOVER);
  }

  /** Selecciona una opción por texto visible. */
  async selectByText(text: string): Promise<void> {
    Logger.action(`Select "${this.formControlName}" → "${text}"`, true);
    await this.open();
    const option = this.page.locator(
      `ion-alert button:has-text("${text}"), .alert-radio-label:has-text("${text}"), ion-select-popover button:has-text("${text}")`,
    ).first();
    await option.click({ timeout: TIMEOUTS.ACCION_RAPIDA });
    await this.page.waitForTimeout(TIMEOUTS.ANGULAR_DIGEST);
    await dismissAllOverlays(this.page);
  }

  /** Selecciona una opción por su índice. */
  async selectByIndex(index: number): Promise<void> {
    await this.open();
    const options = this.page.locator('ion-alert button:visible, .alert-radio-label:visible, ion-select-popover button:visible');
    await options.nth(index).click({ timeout: TIMEOUTS.ACCION_RAPIDA });
    await this.page.waitForTimeout(TIMEOUTS.ANGULAR_DIGEST);
    await dismissAllOverlays(this.page);
  }

  /** Obtiene todas las opciones visibles del select. */
  async getOptions(): Promise<string[]> {
    await this.open();
    const optionEls = this.page.locator(
      'ion-alert button:visible, .alert-radio-label:visible, ion-select-popover button:visible',
    );
    const count = await optionEls.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const t = (await optionEls.nth(i).textContent())?.trim();
      if (t && !texts.includes(t)) texts.push(t);
    }
    await this.page.keyboard.press('Escape');
    await dismissAllOverlays(this.page);
    return texts;
  }

  /** Obtiene el valor actualmente seleccionado (texto visible). */
  async getSelectedText(): Promise<string> {
    const select = this.page.locator(this.rootSelector).first();
    const text = (await select.textContent())?.trim() ?? '';
    return text;
  }

  /** Espera que el select tenga un valor específico. */
  async waitForValue(expected: string, timeout = TIMEOUTS.ACCION_RAPIDA): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const current = await this.getSelectedText();
      if (current.includes(expected)) return;
      await this.page.waitForTimeout(300);
    }
    throw new Error(`Select "${this.formControlName}" no tiene valor "${expected}" después de ${timeout}ms`);
  }

  /** Cierra el popover sin seleccionar. */
  async close(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await dismissAllOverlays(this.page);
    await this.page.waitForTimeout(300);
  }

  /** Verifica si el select está deshabilitado. */
  async isDisabled(): Promise<boolean> {
    return this.page.locator(this.rootSelector).first().isDisabled();
  }

  /** Busca dentro del select (si tiene input de búsqueda en el popover). */
  async searchInOptions(text: string): Promise<void> {
    await this.open();
    const searchInput = this.page.locator('ion-searchbar input, [placeholder*="Buscar"]').first();
    if ((await searchInput.count()) > 0) {
      await searchInput.fill(text);
      await this.page.waitForTimeout(500);
    }
  }
}
