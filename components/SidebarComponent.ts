import { BaseComponent } from '@components/BaseComponent';
import { Logger } from '@utils/logger';
import { TIMEOUTS } from '@config/timeouts';
import type { Page } from '@playwright/test';

/**
 * Abstracción del sidebar de navegación (app-sidebar).
 *
 * @example
 * const sidebar = new SidebarComponent(page);
 * await sidebar.navigateTo('Compras', 'Proveedores');
 */
export class SidebarComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  protected get rootSelector(): string {
    return 'app-sidebar';
  }

  /** Navega a una opción del menú: módulo → submenú → opción.
   *  El sidebar usa hover para desplegar submenús. */
  async navigateTo(modulo: string, opcion: string): Promise<void> {
    Logger.step(`Navegar: ${modulo} > ${opcion}`);

    // Hover sobre el módulo para desplegar submenú
    const moduleLink = this.page.locator(`app-sidebar a:has-text("${modulo}"), app-sidebar [title="${modulo}"]`).first();
    await moduleLink.waitFor({ state: 'visible', timeout: TIMEOUTS.ACCION_RAPIDA });
    await moduleLink.hover();
    await this.page.waitForTimeout(1000);

    // Clic en la opción del submenú
    const optionLink = this.page.locator(`app-sidebar a:has-text("${opcion}"), app-sidebar [title="${opcion}"]`).first();
    await optionLink.waitFor({ state: 'visible', timeout: TIMEOUTS.ACCION_RAPIDA });
    await optionLink.click();
    await this.page.waitForTimeout(2000);
  }

  /** Navega directamente a una ruta conocida (sin usar el menú). */
  async navigateByRoute(route: string): Promise<void> {
    Logger.step(`Navegar a ruta: ${route}`);
    await this.page.goto(route, { waitUntil: 'networkidle', timeout: 15_000 });
    await this.page.waitForTimeout(2000);
  }

  /** Obtiene los nombres de los módulos visibles en el sidebar. */
  async getModuleNames(): Promise<string[]> {
    const links = await this.page.locator('app-sidebar a').all();
    const names: string[] = [];
    for (const link of links) {
      const text = (await link.textContent())?.trim();
      if (text) names.push(text);
    }
    return names;
  }

  /** Verifica que un módulo esté visible en el sidebar. */
  async assertModuleVisible(modulo: string): Promise<void> {
    const visible = await this.page.locator(`app-sidebar:has-text("${modulo}")`).isVisible();
    if (!visible) throw new Error(`Módulo "${modulo}" no visible en el sidebar`);
  }

  /** Abre el menú del módulo (hover). */
  async expandModule(modulo: string): Promise<void> {
    const moduleLink = this.page.locator(`app-sidebar a:has-text("${modulo}")`).first();
    await moduleLink.hover();
    await this.page.waitForTimeout(1000);
  }

  /** Cierra cualquier submenú abierto moviendo el mouse fuera del sidebar. */
  async collapseAll(): Promise<void> {
    await this.page.mouse.move(0, 300);
    await this.page.waitForTimeout(500);
  }
}
