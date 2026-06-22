const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

// dotenv opcional — no crítico
try { require('dotenv').config({ path: path.resolve(__dirname, '.env') }); } catch (e) {}

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 3,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://panel.dev.contabilidad.restaurant.pe/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 20000,
    navigationTimeout: 60000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
