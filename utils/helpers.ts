import type { Page } from '@playwright/test';
import { TIMEOUTS } from '@config/timeouts';

/**
 * Espera controlada. Preferir waitForSelector/waitForResponse sobre esto.
 * Solo para casos sin indicador de carga (cambio de tab, Angular digest).
 */
export async function snooze(page: Page, ms: number): Promise<void> {
  await page.waitForTimeout(ms);
}

/**
 * Elimina overlays flotantes que interceptan clicks en la UI.
 * Caso común: .filtros-absolutos sobre AG Grid.
 */
export async function dismissOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
    const el = document.querySelector('.filtros-absolutos');
    if (el) (el as HTMLElement).style.display = 'none';
  }).catch(() => {});
  await page.waitForTimeout(TIMEOUTS.OVERLAY_DISMISS);
}

/**
 * Elimina TODOS los overlays Ionic abiertos (popovers, alerts, modales, backdrops).
 * Útil después de abrir selects que dejan popovers residuales.
 */
export async function dismissAllOverlays(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelectorAll('ion-popover, ion-alert, ion-action-sheet, ion-modal, ion-backdrop')
      .forEach(el => el.remove());
  }).catch(() => {});
  await page.waitForTimeout(TIMEOUTS.OVERLAY_DISMISS);
}

/**
 * Fuerza el ciclo de detección de cambios de Angular después de fill().
 * Necesario porque Angular no detecta cambios programáticos en inputs.
 */
export async function triggerAngularChangeDetection(page: Page): Promise<void> {
  await page.evaluate(() => {
    const event = new Event('input', { bubbles: true, cancelable: true });
    document.querySelectorAll('input:focus').forEach(el => el.dispatchEvent(event));
  }).catch(() => {});
  await page.waitForTimeout(TIMEOUTS.ANGULAR_DIGEST);
}

/**
 * Espera que la app Angular esté estable.
 * Alternativa a waitForLoadState('networkidle') que puede ser muy lenta.
 */
export async function waitForAngularStable(page: Page): Promise<void> {
  await page.evaluate(() => {
    return (window as any).getAllAngularTestabilities?.()
      ?.every((t: any) => t.isStable());
  }).catch(() => {});
}
