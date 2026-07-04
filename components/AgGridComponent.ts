import { BaseComponent } from '@components/BaseComponent';
import { SHARED_SELECTORS as S } from '@selectors/compartidos';
import { Logger } from '@utils/logger';
import { retry } from '@utils/retry';
import { TIMEOUTS } from '@config/timeouts';
import type { Page } from '@playwright/test';
import type { GridColumn } from '@tipos/index';

/**
 * Abstracción de AG Grid para operaciones de lectura e interacción.
 * Soporta buscar, filtrar, paginar, ordenar, seleccionar filas y exportar.
 *
 * @example
 * const grid = new AgGridComponent(page);
 * await grid.search('PROVEEDOR TEST');
 * const count = await grid.getRowCount();
 * await grid.clickRow(0);
 */
export class AgGridComponent extends BaseComponent {
  private readonly searchInputSelector: string;

  constructor(page: Page, containerSelector?: string) {
    super(page, containerSelector);
    this.searchInputSelector = 'ion-searchbar input, input[placeholder*="Buscar"]';
  }

  protected get rootSelector(): string {
    return this.container ?? S.gridContainer;
  }

  // ── Esperas ──────────────────────────────────────────

  /** Espera hasta que el grid tenga al menos N filas visibles. */
  async waitForRows(minRows = 1, timeout = TIMEOUTS.GRID_CARGA): Promise<void> {
    Logger.step(`Esperar grid con >= ${minRows} filas`);
    await retry(
      async () => {
        const count = await this.getRowCount();
        if (count < minRows) throw new Error(`Grid tiene ${count} filas, esperando >= ${minRows}`);
      },
      { maxAttempts: 10, initialDelay: 500, description: 'waitForRows' },
    );
  }

  /** Espera hasta que el grid esté vacío. */
  async waitForEmpty(timeout = TIMEOUTS.GRID_CARGA): Promise<void> {
    await retry(
      async () => {
        const count = await this.getRowCount();
        if (count > 0) throw new Error(`Grid aún tiene ${count} filas`);
      },
      { maxAttempts: 6, initialDelay: 500, description: 'waitForEmpty' },
    );
  }

  // ── Lectura ──────────────────────────────────────────

  /** Número de filas visibles en el grid. */
  async getRowCount(): Promise<number> {
    return this.page.locator('.ag-row:visible').count();
  }

  /** Nombres de las columnas visibles. */
  async getColumnNames(): Promise<string[]> {
    const headers = await this.page.locator('.ag-header-cell-text:visible').all();
    const names: string[] = [];
    for (const h of headers) {
      const text = (await h.textContent())?.trim();
      if (text) names.push(text);
    }
    return names;
  }

  /** Valor de una celda por índice de fila y nombre de columna. */
  async getCellValue(rowIndex: number, columnName: string): Promise<string> {
    const cols = await this.getColumnNames();
    const colIndex = cols.indexOf(columnName);
    if (colIndex === -1) throw new Error(`Columna "${columnName}" no encontrada. Columnas: ${cols.join(', ')}`);
    const cell = this.page.locator(`.ag-row:visible`).nth(rowIndex).locator(`[col-id]`).nth(colIndex);
    return (await cell.textContent())?.trim() ?? '';
  }

  /** Verifica si existe una fila que contenga el texto dado. */
  async rowExists(text: string): Promise<boolean> {
    const count = await this.page.locator(`.ag-row:visible:has-text("${text}")`).count();
    return count > 0;
  }

  /** Obtiene el contenido completo de una fila como texto. */
  async getRowText(rowIndex: number): Promise<string> {
    const row = this.page.locator('.ag-row:visible').nth(rowIndex);
    return (await row.textContent())?.trim() ?? '';
  }

  /** Lista de objetos { index, name, sortable } para cada columna. */
  async getColumns(): Promise<GridColumn[]> {
    const headers = await this.page.locator('.ag-header-cell').all();
    const cols: GridColumn[] = [];
    for (let i = 0; i < headers.length; i++) {
      const name = (await headers[i].locator('.ag-header-cell-text').textContent())?.trim() ?? '';
      const sortable = (await headers[i].locator('.ag-header-icon').count()) > 0;
      if (name) cols.push({ index: i, name, sortable });
    }
    return cols;
  }

  // ── Búsqueda ─────────────────────────────────────────

  /** Busca texto en el grid usando el ion-searchbar asociado. */
  async search(text: string): Promise<void> {
    Logger.action(`Buscar en grid: "${text}"`, true);
    const searchInput = this.page.locator(this.searchInputSelector).first();
    await searchInput.waitFor({ state: 'visible', timeout: TIMEOUTS.ACCION_RAPIDA });
    await searchInput.fill(text);
    await searchInput.press('Enter');
    await this.page.waitForTimeout(1000);
  }

  /** Limpia la búsqueda actual. */
  async clearSearch(): Promise<void> {
    const searchInput = this.page.locator(this.searchInputSelector).first();
    await searchInput.clear();
    await searchInput.press('Enter');
    await this.page.waitForTimeout(500);
  }

  // ── Filtrado por columna ─────────────────────────────

  /** Aplica un filtro en una columna específica (si tiene floating filter). */
  async filterColumn(columnName: string, value: string): Promise<void> {
    Logger.action(`Filtrar columna "${columnName}" = "${value}"`, true);
    const cols = await this.getColumnNames();
    const colIndex = cols.indexOf(columnName);
    if (colIndex === -1) throw new Error(`Columna "${columnName}" no encontrada`);
    const filterInput = this.page.locator('.ag-floating-filter-input input').nth(colIndex);
    await filterInput.fill(value);
    await filterInput.press('Enter');
    await this.page.waitForTimeout(800);
  }

  // ── Ordenamiento ─────────────────────────────────────

  /** Hace clic en el header de una columna para ordenar. */
  async sortBy(columnName: string): Promise<void> {
    Logger.action(`Ordenar por "${columnName}"`, true);
    const header = this.page.locator(`.ag-header-cell-text:has-text("${columnName}")`);
    await header.click();
    await this.page.waitForTimeout(500);
  }

  // ── Selección / Interacción ──────────────────────────

  /** Hace clic en una fila por índice (abre split-view si aplica). */
  async clickRow(rowIndex: number): Promise<void> {
    Logger.action(`Clic en fila ${rowIndex}`, true);
    const row = this.page.locator('.ag-row:visible').nth(rowIndex);
    await row.click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  /** Doble clic en una fila. */
  async doubleClickRow(rowIndex: number): Promise<void> {
    Logger.action(`Doble clic en fila ${rowIndex}`, true);
    const row = this.page.locator('.ag-row:visible').nth(rowIndex);
    await row.dblclick({ force: true });
    await this.page.waitForTimeout(1000);
  }

  /** Hace clic en una acción de la columna Acciones de una fila. */
  async clickRowAction(rowIndex: number, actionText: string): Promise<void> {
    Logger.action(`Acción "${actionText}" en fila ${rowIndex}`, true);
    const row = this.page.locator('.ag-row:visible').nth(rowIndex);
    const btn = row.locator(`button:has-text("${actionText}"), ion-button:has-text("${actionText}"), ion-icon[name*="${actionText}"]`);
    await btn.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /** Selecciona el checkbox de selección de una fila. */
  async selectRow(rowIndex: number): Promise<void> {
    const cb = this.page.locator('.ag-row:visible').nth(rowIndex).locator('.ag-checkbox input, ion-checkbox');
    if ((await cb.count()) > 0) {
      await cb.click();
      await this.page.waitForTimeout(300);
    }
  }

  /** Selecciona todas las filas vía checkbox del header. */
  async selectAll(): Promise<void> {
    const cb = this.page.locator('.ag-header-select-all input, .ag-checkbox:visible').first();
    if ((await cb.count()) > 0) {
      await cb.click();
      await this.page.waitForTimeout(300);
    }
  }

  // ── Paginación ───────────────────────────────────────

  /** Número total de páginas según el panel de paginación. */
  async getTotalPages(): Promise<number> {
    const text = await this.page.locator('.ag-paging-panel .ag-paging-page-summary-panel').textContent().catch(() => '');
    const match = text?.match(/de (\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }

  /** Navega a la página siguiente. */
  async nextPage(): Promise<void> {
    const btn = this.page.locator('.ag-paging-button-next, [ref="btNext"]');
    if (await btn.isEnabled().catch(() => false)) {
      await btn.click();
      await this.page.waitForTimeout(500);
    }
  }

  /** Navega a la página anterior. */
  async previousPage(): Promise<void> {
    const btn = this.page.locator('.ag-paging-button-previous, [ref="btPrevious"]');
    if (await btn.isEnabled().catch(() => false)) {
      await btn.click();
      await this.page.waitForTimeout(500);
    }
  }

  /** Navega a una página específica. */
  async goToPage(pageNum: number): Promise<void> {
    const input = this.page.locator('.ag-paging-panel input[type="number"]');
    if ((await input.count()) > 0) {
      await input.fill(String(pageNum));
      await input.press('Enter');
      await this.page.waitForTimeout(800);
    }
  }

  // ── Exportación ──────────────────────────────────────

  /** Hace clic en el botón Exportar Excel del grid. */
  async exportToExcel(): Promise<void> {
    const btn = this.page.locator('button:has-text("Excel"), ion-button:has-text("Excel"), [title*="Excel"]').first();
    await btn.click();
    await this.page.waitForTimeout(1000);
  }

  /** Hace clic en el botón Exportar PDF del grid. */
  async exportToPDF(): Promise<void> {
    const btn = this.page.locator('button:has-text("PDF"), ion-button:has-text("PDF"), [title*="PDF"]').first();
    await btn.click();
    await this.page.waitForTimeout(1000);
  }

  // ── Validación de estado ─────────────────────────────

  /** Verifica que el grid muestre el mensaje de "no se encontraron registros". */
  async assertEmptyState(expectedMessage = 'No se encontraron'): Promise<void> {
    const overlay = this.page.locator('.ag-overlay-no-rows-center, .ag-overlay-loading-center');
    const text = (await overlay.textContent().catch(() => ''))?.trim() ?? '';
    if (!text.includes(expectedMessage)) {
      throw new Error(`Estado vacío esperado con "${expectedMessage}", pero se encontró "${text}"`);
    }
  }

  /** Verifica que el grid tenga al menos una fila visible. */
  async assertHasRows(): Promise<void> {
    const count = await this.getRowCount();
    if (count === 0) throw new Error('Se esperaba que el grid tuviera filas, pero está vacío');
  }
}
