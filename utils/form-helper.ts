import type { Page } from '@playwright/test';
import { TIMEOUTS } from '@config/timeouts';

/**
 * Llena un ion-input usando formControlName (selector más estable).
 * Incluye dispatchEvent('ionChange') + press('Tab') para Angular change detection.
 */
export async function fillField(
  page: Page,
  formControlName: string,
  value: string
): Promise<void> {
  const selector = `ion-input[formcontrolname="${formControlName}"] input`;
  const input = page.locator(selector).first();
  await input.waitFor({ state: 'visible', timeout: TIMEOUTS.ACCION_RAPIDA });
  await input.fill(value);
  await input.dispatchEvent('ionChange');
  await input.press('Tab');
  await page.waitForTimeout(TIMEOUTS.ANGULAR_DIGEST);
}

/**
 * Limpia un ion-input.
 */
export async function clearField(
  page: Page,
  formControlName: string
): Promise<void> {
  const selector = `ion-input[formcontrolname="${formControlName}"] input`;
  const input = page.locator(selector).first();
  await input.clear();
  await input.press('Tab');
}

/**
 * Obtiene el valor actual de un ion-input.
 */
export async function getFieldValue(
  page: Page,
  formControlName: string
): Promise<string> {
  const selector = `ion-input[formcontrolname="${formControlName}"] input`;
  return page.locator(selector).first().inputValue();
}

/**
 * Abre un ion-select y selecciona una opción por texto.
 */
export async function selectOption(
  page: Page,
  formControlName: string,
  optionText: string
): Promise<void> {
  const select = page.locator(`ion-select[formcontrolname="${formControlName}"]`).first();
  await select.waitFor({ state: 'visible', timeout: TIMEOUTS.ACCION_RAPIDA });
  await select.click();
  await page.waitForTimeout(TIMEOUTS.SELECT_POPOVER);

  // El popover puede ser ion-alert (mobile) o ion-popover (desktop)
  const option = page.locator(`ion-alert button:has-text("${optionText}"), .alert-radio-label:has-text("${optionText}"), ion-select-popover button:has-text("${optionText}")`).first();
  await option.click({ timeout: TIMEOUTS.ACCION_RAPIDA });
  await page.waitForTimeout(TIMEOUTS.ANGULAR_DIGEST);
}

/**
 * Abre un ion-select y captura todas las opciones visibles.
 */
export async function getSelectOptions(
  page: Page,
  formControlName: string
): Promise<string[]> {
  const select = page.locator(`ion-select[formcontrolname="${formControlName}"]`).first();
  await select.click();
  await page.waitForTimeout(TIMEOUTS.SELECT_POPOVER);

  const optionEls = page.locator('ion-alert button:visible, .alert-radio-label:visible, ion-select-popover button:visible');
  const count = await optionEls.count();
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = (await optionEls.nth(i).textContent())?.trim();
    if (t && !texts.includes(t)) texts.push(t);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  return texts;
}

/**
 * Llena un ion-textarea.
 */
export async function fillTextarea(
  page: Page,
  formControlName: string,
  value: string
): Promise<void> {
  const selector = `ion-textarea[formcontrolname="${formControlName}"] textarea`;
  const el = page.locator(selector).first();
  await el.fill(value);
  await el.press('Tab');
  await page.waitForTimeout(TIMEOUTS.ANGULAR_DIGEST);
}

/**
 * Hace clic en un botón visible por su texto.
 */
export async function clickButton(
  page: Page,
  text: string
): Promise<void> {
  const btn = page.locator(`button:has-text("${text}"), ion-button:has-text("${text}")`).first();
  await btn.waitFor({ state: 'visible', timeout: TIMEOUTS.ACCION_RAPIDA });
  await btn.click();
}

/**
 * Verifica si un botón está deshabilitado.
 */
export async function isButtonDisabled(
  page: Page,
  text: string
): Promise<boolean> {
  const btn = page.locator(`button:has-text("${text}"), ion-button:has-text("${text}")`).first();
  return btn.isDisabled();
}

/**
 * Hace clic en un checkbox por formControlName.
 */
export async function toggleCheckbox(
  page: Page,
  formControlName: string,
  check: boolean
): Promise<void> {
  const cb = page.locator(`ion-checkbox[formcontrolname="${formControlName}"]`).first();
  const isChecked = (await cb.getAttribute('checked')) !== null;
  if (isChecked !== check) {
    await cb.click();
  }
}
