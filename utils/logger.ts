/**
 * Logger estructurado para tests Playwright.
 * Niveles: suite → test → step → action/api/screenshot.
 */

type LogLevel = 'suite' | 'test' | 'step' | 'action' | 'api' | 'screenshot' | 'error' | 'warn';

const PREFIX: Record<LogLevel, string> = {
  suite: '\n🏁',
  test: '  🧪',
  step: '    📍',
  action: '      🔧',
  api: '      🌐',
  screenshot: '      📸',
  error: '      ❌',
  warn: '      ⚠️',
};

function log(level: LogLevel, message: string, extra?: string): void {
  const prefix = PREFIX[level];
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const extraStr = extra ? ` [${extra}]` : '';
  console.log(`${prefix} ${message}${extraStr}`);
}

export const Logger = {
  suite(name: string): void {
    log('suite', `SUITE: ${name}`);
  },

  test(name: string, tags: string[] = []): void {
    const tagStr = tags.length > 0 ? ` [${tags.join(', ')}]` : '';
    log('test', `${name}${tagStr}`);
  },

  step(description: string): void {
    log('step', description);
  },

  action(what: string, success: boolean): void {
    log('action', `${what} → ${success ? '✅' : '❌'}`);
  },

  api(method: string, url: string, status: number): void {
    const statusIcon = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : '⚠️';
    log('api', `${method} ${url}`, `${status} ${statusIcon}`);
  },

  screenshot(path: string): void {
    log('screenshot', path);
  },

  error(message: string): void {
    log('error', message);
  },

  warn(message: string): void {
    log('warn', message);
  },
};
