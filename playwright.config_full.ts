import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from a file if present.
 * Useful for local development configurations.
 * https://playwright.dev/docs/test-parameterization
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(import.meta.dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration for a full configuration breakdown.
 */
export default defineConfig({
  // --- Core Test Setup ---
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  testIgnore: '**/working-drafts/**',
  timeout: 30 * 1000, // 30 seconds limit per single test case
  expect: {
    timeout: 5000, // Maximum time expect() should wait for conditions
    toHaveScreenshot: { maxDiffPixels: 100 }, // Visual regression threshold adjustments
  },

  // --- Execution & Parallelism Controls ---
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // Fails build if test.only is committed by mistake on CI
  retries: process.env.CI ? 2 : 0, // Retry failed tests twice on CI, run once locally
  workers: process.env.CI ? 1 : undefined, // Force sequential execution on CI resources

  // --- Reporting & Output Formats ---
  reporter: [
    ['list'], // Simple console output tracking test iterations
    ['html', { open: 'never', outputFolder: 'playwright-report' }], // Interactive report browser
    ['json', { outputFile: 'test-results/report.json' }] // Structured data export for CI dashboards
  ],
  outputDir: 'test-results/', // Directory storing test artifacts (screenshots, videos, traces)

  // --- Shared Settings Across Global Projects ---
  use: {
    // Base URL to use for actions like await page.goto('/')
    baseURL: 'https://parabank.parasoft.com',

    // Browser Context Properties
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    timezoneId: 'Asia/Kolkata',
    locale: 'en-IN',

    // Artifact Collection Strategies
    trace: 'on-first-retry', // 'on', 'off', 'retain-on-failure', or 'on-first-retry'
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true, // This will now scale up cleanly across the wide viewport
    }, // 'on', 'off', or 'only-on-failure'
    
    video: 'retain-on-failure', // 'on', 'off', 'retain-on-failure', or 'on-first-retry'

    // Network & Interaction Rules
    actionTimeout: 10000, // Max wait time for internal element actions (click, type, etc.)
    navigationTimeout: 15000, // Max wait time for page.goto() navigation events
  },

  // --- Multi-Browser & Responsive Projects Execution Grid ---
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against specific branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  // --- Environment Orchestration Setup ---
  // Run a local webserver binary automatically before booting test suites
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});