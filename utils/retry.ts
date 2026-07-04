import { Logger } from '@utils/logger';

/**
 * Retry con backoff exponencial para operaciones potencialmente flaky.
 * Útil para esperar condiciones de UI que dependen de APIs lentas.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelay?: number;
    backoffFactor?: number;
    description?: string;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 500,
    backoffFactor = 2,
    description = 'operación',
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e as Error;
      if (attempt < maxAttempts) {
        const delay = initialDelay * Math.pow(backoffFactor, attempt - 1);
        Logger.warn(`Retry ${attempt}/${maxAttempts} de "${description}" — esperando ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`"${description}" falló después de ${maxAttempts} intentos: ${lastError?.message}`);
}

/**
 * Retry específico para esperar que un locator sea visible.
 */
export async function retryUntilVisible(
  locator: ReturnType<import('@playwright/test').Page['locator']>,
  options: { maxAttempts?: number; description?: string } = {}
): Promise<void> {
  await retry(
    async () => {
      const visible = await locator.isVisible();
      if (!visible) throw new Error('Elemento no visible');
    },
    { ...options, description: options.description || 'esperar visible' }
  );
}
