import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

// Vorinstallierter Chromium der Remote-Umgebung (sonst: regulärer Playwright-Browser)
const preinstalledChromium = '/opt/pw-browsers/chromium';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    ...(existsSync(preinstalledChromium)
      ? { launchOptions: { executablePath: preinstalledChromium } }
      : {}),
  },
  webServer: {
    command: 'npx vite --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
