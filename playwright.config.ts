import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const AUTH_FILE = 'auth/auth.json';
const BASE_URL = process.env.BASE_URL || 'https://panel.dev.contabilidad.restaurant.pe';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
  },

  projects: [
    // ── Setup: login global ──
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      testDir: './auth',
      use: { ...devices['Desktop Chrome'] },
    },

    // ── Tests con sesión autenticada ──
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
      dependencies: ['setup'],
    },

    // ── Tests sin autenticación (login, auth) ──
    {
      name: 'chromium-no-auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /login\.spec\.ts/,
    },
  ],
});
