import * as fs from 'fs';
import * as path from 'path';

/** Lee un archivo JSON y lo parsea. */
export function readJSON<T = unknown>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

/** Escribe un objeto como JSON con formato. */
export function writeJSON(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/** Verifica si un archivo existe. */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/** Espera a que un archivo descargado exista en el directorio de descargas. */
export async function waitForDownload(
  downloadDir: string,
  pattern: RegExp,
  timeoutMs: number = 15_000
): Promise<string | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const files = fs.readdirSync(downloadDir);
    const match = files.find(f => pattern.test(f));
    if (match) return path.join(downloadDir, match);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return null;
}

/** Crea un directorio si no existe. */
export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}
