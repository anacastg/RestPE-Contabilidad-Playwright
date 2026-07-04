import { BaseComponent } from '@components/BaseComponent';
import { Logger } from '@utils/logger';
import { TIMEOUTS } from '@config/timeouts';
import { today, toDateInput } from '@utils/date-utils';
import type { Page } from '@playwright/test';

/**
 * Abstracción de selector de fecha (ion-input type="date" o app-base-calendar-new).
 *
 * @example
 * const dp = new DatePickerComponent(page, 'fechaEntrega');
 * await dp.setDate('2026-07-15');
 * const val = await dp.getDate();
 */
export class DatePickerComponent extends BaseComponent {
  private readonly formControlName: string;

  constructor(page: Page, formControlName: string) {
    super(page);
    this.formControlName = formControlName;
  }

  protected get rootSelector(): string {
    return `ion-input[formcontrolname="${this.formControlName}"] input`;
  }

  /** Selecciona una fecha (string YYYY-MM-DD o Date). */
  async setDate(date: string | Date): Promise<void> {
    const value = typeof date === 'string' ? date : toDateInput(date);
    Logger.action(`Set date "${this.formControlName}" = ${value}`, true);
    const input = this.page.locator(this.rootSelector).first();
    await input.waitFor({ state: 'visible', timeout: TIMEOUTS.ACCION_RAPIDA });
    await input.fill(value);
    await input.press('Tab');
    await this.page.waitForTimeout(TIMEOUTS.ANGULAR_DIGEST);
  }

  /** Selecciona la fecha de hoy. */
  async setToday(): Promise<void> {
    await this.setDate(today());
  }

  /** Obtiene la fecha actual como string YYYY-MM-DD. */
  async getDate(): Promise<string> {
    const input = this.page.locator(this.rootSelector).first();
    return input.inputValue();
  }

  /** Limpia la fecha. */
  async clear(): Promise<void> {
    const input = this.page.locator(this.rootSelector).first();
    await input.clear();
    await input.press('Tab');
    await this.page.waitForTimeout(TIMEOUTS.ANGULAR_DIGEST);
  }

  /** Verifica que la fecha tenga el formato YYYY-MM-DD. */
  async validateFormat(): Promise<boolean> {
    const value = await this.getDate();
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  /** Verifica si el campo está deshabilitado. */
  async isDisabled(): Promise<boolean> {
    return this.page.locator(this.rootSelector).first().isDisabled();
  }
}
