# Browser Context with Storage State

- For a large banking application with numerous pages, you should choose the storageState (BrowserContext) approach.
Invoking a login sequence via the UI before every single test page will cause your test suite execution time to explode. Banking apps often have slow login flows involving multi-step forms, animations, or security checks.
Here is a breakdown of why storageState is the superior choice for large projects, along with how to implement it cleanly using your fixture architecture. [1] 
## Why storageState Wins at Scale

* Massive Time Savings: You log in exactly once at the start of the test run (or per user role). All subsequent tests skip the login UI entirely and launch directly into an authenticated state. [2, 3, 4, 5, 6] 
* Reduced Test Flakiness: The login page is a high-traffic area. Bypassing it in 99% of your tests eliminates a major point of random UI failure.
* Realistic User Sessions: It natively saves cookies, localStorage, and sessionStorage into a JSON file, mirroring how a real browser persists a session. [7, 8] 

## The Trade-offs to Keep in Mind

* MFA/2FA Limitations: If your banking app strictly requires a dynamic One-Time Password (OTP) for every single session initialization, API token injection or specialized staging bypasses must be used during the setup phase.
* No UI Coverage for Login: Because you skip the UI login, you must create one dedicated test file (login.spec.ts) that specifically tests the login page UI, error states, and validations. [9] 

------------------------------
## Implementation Guide for Your Fixture Pipeline
Here is how to integrate storageState seamlessly into the exact architectural diagram you provided earlier.
## 1. Configure global setup in playwright.config.ts [10] 
Set up a "setup" project that runs first to capture the login state. [11] 

``` typescript
import { defineConfig } from '@playwright/test';
export default defineConfig({
  projects: [
    // 1. Define the Setup Project
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // 2. Define Main Testing Projects that depend on Setup
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        // Instruct Playwright to automatically load this storage state
        storageState: '.auth/user.json', 
      },
      dependencies: ['setup'], // Ensures setup runs first
    },
  ],
});
```

## 2. Create the Setup file (auth.setup.ts) [12] 
This file runs once, performs the UI login, and dumps the session data to a local file. [13, 14] 

``` typescript
import { test as setup } from '@playwright/test';import { LoginPage } from './pages/LoginPage'; // Your Page Object
const authFile = '.auth/user.json';

setup('authenticate banking user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.navigate();
  await loginPage.login('bank_user_123', 'secure_password');
  
  // Wait for the app to land on the dashboard (session tokens are set)
  await page.waitForURL('**/dashboard'); 

  // Save the context state to disk
  await page.context().storageState({ path: authFile });
});
```

## 3. Your Custom Fixture File (fixtures.ts) [15] 
Your custom fixture pipeline remains completely clean. Because the configuration handles injecting the storageState into the core page object, your custom fixtures automatically receive an already logged-in page.

``` typescript
import { test as base } from '@playwright/test';
import { AccountsPage } from './pages/AccountsPage';
import { TransferPage } from './pages/TransferPage';

type BankingFixtures = {
  accountsPage: AccountsPage;
  transferPage: TransferPage;
};
export const test = base.extend<BankingFixtures>({
  accountsPage: async ({ page }, use) => {
    // The page here is already authenticated via storageState
    await use(new AccountsPage(page));
  },
  transferPage: async ({ page }, use) => {
    await use(new TransferPage(page));
  },
});
export { expect } from '@playwright/test';
```

------------------------------

[1] [https://medium.com](https://medium.com/@divyakandpal93/playwright-fixtures-test-data-keep-your-tests-clean-tidy-reusable-fc08ebc99e22)
[2] [https://tech-insider.org](https://tech-insider.org/playwright-tutorial-end-to-end-testing-2026/)
[3] [https://www.linkedin.com](https://www.linkedin.com/top-content/technology/software-testing-basics/setting-up-local-test-suites/)
[4] [https://currents.dev](https://currents.dev/posts/testing-authentication-with-playwright-the-complete-guide)
[5] [https://white-test.com](https://white-test.com/for-qa/useful-articles-for-qa/playwright-e2e-testing/)
[6] [https://testdino.com](https://testdino.com/blog/playwright-framework-setup)
[7] [https://getautonoma.com](https://getautonoma.com/blog/playwright-best-practices-2026)
[8] [https://www.arrangility.com](https://www.arrangility.com/blog/playwright-storagestate-authentication)
[9] [https://www.browserstack.com](https://www.browserstack.com/guide/fixtures-in-playwright)
[10] [https://circleci.com](https://circleci.com/blog/understanding-playwright-test-hooks-and-ci/)
[11] [https://www.arrangility.com](https://www.arrangility.com/blog/playwright-storagestate-authentication)
[12] [https://www.teemutaskula.com](https://www.teemutaskula.com/blog/speedup-playwright-auth)
[13] [https://testdino.com](https://testdino.com/blog/playwright-authentication)
[14] [https://testdino.com](https://testdino.com/blog/playwright-architecture)
[15] [https://tech-insider.org](https://tech-insider.org/playwright-tutorial-end-to-end-testing-2026/)
[16] [https://www.linkedin.com](https://www.linkedin.com/posts/sogetilabs_automating-mfa-testing-with-playwright-storage-activity-7413889754234023937-TxtI)
