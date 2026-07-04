import type { Page } from '@playwright/test';
import { Logger } from '@utils/logger';
import { snooze } from '@utils/helpers';
import { RUTAS } from '@constants/index';

/**
 * Clase base para todos los Page Objects.
 * Provee navegación, logging y acceso a la página.
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navega a la ruta de la pantalla. Override en subclase. */
  protected abstract get ruta(): string;

  /** Nombre legible de la pantalla para logs. */
  protected abstract get nombre(): string;

  /** Navega a esta pantalla y espera que cargue. */
  async navegar(): Promise<void> {
    Logger.step(`Navegar a ${this.nombre}`);
    await this.page.goto(this.ruta, { waitUntil: 'networkidle', timeout: 15_000 });
    await snooze(this.page, 2_000);
    await this.esperarCarga();
  }

  /** Override en subclase para esperar elementos específicos de la pantalla. */
  protected async esperarCarga(): Promise<void> {
    // Por defecto espera networkidle. Las subclases sobreescriben con waitForSelector.
  }

  /** Título de la página actual. */
  async getTitulo(): Promise<string> {
    return this.page.title();
  }

  /** URL actual. */
  get url(): string {
    return this.page.url();
  }
}
