import { BaseComponent } from '@components/BaseComponent';
import { Logger } from '@utils/logger';
import type { Page } from '@playwright/test';

/**
 * Abstracción de carga de archivos (input[type="file"]).
 *
 * @example
 * const upload = new UploadComponent(page);
 * await upload.uploadFile('input[type="file"]', './factura.xml');
 * const name = await upload.getFileName();
 */
export class UploadComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  protected get rootSelector(): string {
    return 'input[type="file"]';
  }

  /** Carga un archivo en un input file. */
  async uploadFile(fileInputSelector: string, filePath: string): Promise<void> {
    Logger.action(`Upload: ${filePath}`, true);
    const input = this.page.locator(fileInputSelector);
    await input.setInputFiles(filePath);
    await this.page.waitForTimeout(1000);
  }

  /** Carga múltiples archivos. */
  async uploadFiles(fileInputSelector: string, filePaths: string[]): Promise<void> {
    Logger.action(`Upload múltiple: ${filePaths.length} archivos`, true);
    const input = this.page.locator(fileInputSelector);
    await input.setInputFiles(filePaths);
    await this.page.waitForTimeout(1000);
  }

  /** Nombre del archivo cargado (desde el label o indicador visual). */
  async getFileName(fileLabelSelector: string): Promise<string> {
    const label = this.page.locator(fileLabelSelector).first();
    return (await label.textContent())?.trim() ?? '';
  }

  /** Elimina el archivo cargado (si hay botón de eliminar). */
  async removeFile(): Promise<void> {
    const btn = this.page.locator('button:has-text("Eliminar"), ion-button:has-text("Eliminar"), [aria-label="Eliminar archivo"], ion-icon[name="trash"]').first();
    if ((await btn.count()) > 0) {
      await btn.click();
      await this.page.waitForTimeout(500);
    }
  }

  /** Verifica que el archivo se haya cargado (indicador visual presente). */
  async assertFileUploaded(fileLabelSelector: string, expectedName: string): Promise<void> {
    const name = await this.getFileName(fileLabelSelector);
    if (!name.includes(expectedName)) {
      throw new Error(`Nombre de archivo esperado "${expectedName}", encontrado "${name}"`);
    }
  }
}
