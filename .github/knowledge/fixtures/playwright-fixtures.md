# Playwright Fixtures

- In simple terms, a fixture is like a concise, automated setup assistant for your tests. [1] 
Think of a fixture as a smart service that prepares everything a specific test needs before it starts, hands it over to the test case, and then neatly cleans up everything afterward.

## 🍳 The Real-World Analogy
Imagine you are a chef running a cooking competition:

* Without Fixtures: Before every single round, you have to personally clean the kitchen, chop the vegetables, turn on the oven, cook the meal, and scrub the pans afterward. Your code becomes bloated with repetitive prep work.
* With Fixtures: You hire a prep sous-chef. When a round starts, you just tell them, "Give me chopped onions and a hot oven." They hand you exactly that. When you are done cooking, they step in and clean up the mess automatically.

- In Playwright, page is actually a built-in fixture! You don't write code to launch a browser, open a context, and open a tab; Playwright's page fixture gives you a clean browser tab instantly. [2, 3] 
------------------------------
## 🛠️ Example 1: Creating a Custom Page Object Fixture
Instead of manually creating instances of your Page Objects inside every single test file over and over again, you can create a custom fixture to handle it.
## Step 1: Define the Fixtures
You extend Playwright's core testing capabilities to include your custom Page Objects. [4, 5] 

``` typescript
// fixtures/base.fixture.ts
import { test as baseTest } from '@playwright/test';
import { LoginPage } from '#pages/login.page';
import { DashboardPage } from '#pages/dashboard.page';

// 1. Declare the types for your custom fixtures
type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

// 2. Extend the base test object to include your custom assistants
export const test = baseTest.extend<MyFixtures>({
  // Define the loginPage fixture blueprint
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    // Code BEFORE 'use' runs before the test starts (Setup)
    await loginPage.goto(); 
    
    // Pass the prepared object into the test
    await use(loginPage); 
    
    // Code AFTER 'use' runs when the test completes (Teardown/Cleanup)
    console.log('Test complete! LoginPage fixture tearing down.');
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  }
});
// Re-export the standard expect assertion library so it matches our new test layout
export { expect } from '@playwright/test';
```

### Explain Lines

``` typescript
  welcomePage: async ({ page }, use) => {
```
- This line defines a custom fixture named welcomePage by declaring an asynchronous function that Playwright runs whenever a test requests that fixture.
Here is the exact breakdown of what each part means:

* welcomePage: – The name of your custom fixture. You will use this exact name in your test arguments (e.g., test('my test', async ({ welcomePage }) => { ... })).
* async (...) => – An asynchronous arrow function. Fixtures in Playwright are asynchronous because they setup and teardown browser environments, which takes time.
* { page } – Object destructuring that pulls Playwright's built-in page fixture into your custom fixture. This gives your custom page object access to the actual browser tab.
* use – A special callback function provided by Playwright. It acts as a bridge; you pass your initialized page object to use(), which hands it over to the test. Everything before use() is setup logic, and everything after is teardown logic.

### Metaphor to understand it easily
Think of this line as a concierge service for your test:

   1. It looks at the blueprint ({ page }) to see what it needs.
   2. It prepares the room (instantiates new WelcomePage(page)).
   3. It hands the keys to your test (use).
   4. It waits for the guest to check out (the test finishes), then cleans up the room.

### Extend()

- Yes, extend is a built-in Playwright method belonging to the test object. [1] 
It is specifically designed to create a new, customized version of the Playwright test runner. [2] 

### What it does

* Creates child test instances: It copies the core Playwright test functionality but allows you to append custom features.
* Registers custom fixtures: It tells Playwright how to set up, provide, and tear down your Page Object Models (welcomePage, homePage).
* Enforces TypeScript types: By passing <MyFixtures> to baseTest.extend<MyFixtures>, it ensures your test files get autocomplete and type-checking for your custom pages. [3, 4, 5, 6, 7] 

### Where it lives in Playwright
It is a method on the TestType interface. When you import test as baseTest from @playwright/test, you are fetching Playwright's default test runner, and .extend() is the gateway to configuring it for your project's specific framework. [8, 9, 10] 


## Step 2: Use the Fixtures inside your Test File [6] 
Now, look at how incredibly clean and readable your test specs become. You simply call your fixtures by name in the argument block: [7, 8] 

``` typescript
// tests/login.spec.ts
import { test, expect } from '#fixtures/base.fixture'; // Import your custom setup

test('Successful login check', async ({ loginPage, dashboardPage }) => {
  // Your page object is already instantiated, navigated, and ready!
  await loginPage.login('john_doe', 'Password123!');
  
  // Assert the outcome
  await expect(dashboardPage.welcomeHeader).toBeVisible();
});
```

------------------------------
## 🚀 Example 2: A Database Seeding Fixture (With Automated Teardown)
Fixtures are incredibly powerful for managing test data states. Let's create a fixture that inserts a clean user record into a database before a test and deletes it when the test is done. [9] 

``` typescript
// fixtures/db.fixture.ts
import { test as baseTest } from '@playwright/test';
import { query, dbPool } from '#utils/db';
type DBFixtures = {
  seededUser: { id: number; username: string };
};
export const dbTest = baseTest.extend<DBFixtures>({
  seededUser: async ({}, use) => {
    // 1. SETUP: Create a temporary test user in the database
    const uniqueName = `test_user_${Date.now()}`;
    const result = await query(
      'INSERT INTO users (username, balance) VALUES ($1, 500) RETURNING id, username', 
      [uniqueName]
    );
    const user = result[0];

    // 2. HANDOVER: Deliver the database user data into the test case
    await use(user);

    // 3. TEARDOWN: Clean up the database automatically after the test ends
    await query('DELETE FROM users WHERE id = $1', [user.id]);
    console.log(`Cleaned up test data for user ID: ${user.id}`);
  }
});
```

Using this fixture means you never have to worry about dummy data cluttering your databases or causing primary-key conflicts on future test iterations.


# Flow

- The page variable is coming directly from Playwright's own built-in core fixtures library.
You do not need to import, initialize, or build the page object yourself. The moment you extend Playwright's base test block (baseTest.extend), Playwright passes its native browser automation tools into your custom fixture framework automatically. [1] 
------------------------------
## 🔍 Tracking the Chain of Custody
Here is the exact step-by-step path showing where page is born and how it reaches your custom code:
## Step 1: The Core Source
When you call import { test as baseTest } from '@playwright/test', you are bringing in Playwright's master testing engine. Deep inside the Playwright source code, engineers have already built a set of default fixtures. These defaults automatically manage opening a browser, setting up an isolated browser context, and opening a clean web page tab.
## Step 2: The Hand-Off to Your Fixture File
When you write your custom base.fixture.ts file, you request that core page fixture by listing it inside the argument bracket of your fixture declaration block:

``` typescript
// fixtures/base.fixture.ts
export const test = baseTest.extend<MyFixtures>({
  
  // Playwright looks at this text: "{ page }" 
  // It says: "Ah, you need a web page tab! Here is one from my core engine."
  loginPage: async ({ page }, use) => {
    
    // Now you can cleanly feed Playwright's page straight into your Page Object
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});
```

## Step 3: The Final Delivery to Your Test Spec
Once your fixture file hooks everything up, your final test files don't need to ask Playwright for a raw page anymore. They just ask for your custom-built wrapper instead:

``` typescript
// tests/login.spec.ts
import { test } from '#fixtures/base.fixture';
// The test runner asks your custom fixture for 'loginPage'// Your custom fixture uses Playwright's core 'page' to build it, then hands it over here!
test('My Test', async ({ loginPage }) => {
  await loginPage.goto();
});
```

------------------------------
## 🧩 The Multi-Layered Hierarchy
Think of the data flow like a set of Russian nesting dolls. Each layer supplies the foundation for the next layer down:

$$
\text{Playwright Core Engine (Provides } \mathbf{page}\text{)} \longrightarrow \text{Custom Fixture File (Receives } \mathbf{page}\text{, builds Page Objects)} \longrightarrow \text{Your Test Spec (Uses finished Page Objects)}
$$

<hr>
<hr>

# Handling multiple pages with same session

For a large banking application with numerous pages, you should choose the storageState (BrowserContext) approach.
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
import { test as setup } from '@playwright/test';
import { LoginPage } from './pages/LoginPage'; // Your Page Object
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

# Role Based Testing

When handling multiple user roles (e.g., Admin, Customer, Auditor) in a banking application, you have two primary architectural paths. [1, 2, 3, 4] 
The storageState-based approach is the industry standard for large suites because it logs each user in exactly once, saves their sessions to unique JSON files, and injects them as needed. The Fixture-only approach handles logins dynamically on-the-fly during test execution. [5, 6, 7, 8] 
------------------------------
## Approach 1: The storageState Approach (Recommended for Scale)
This method uses Playwright's native orchestration. It runs a setup project first to generate independent session files for each role, then maps those files to custom fixtures. [9, 10] 
## 1. Configure the Setup dependencies in playwright.config.ts [11] 

``` typescript
import { defineConfig } from '@playwright/test';
export default defineConfig({
  projects: [
    // Step 1: Run the global auth setups first
    {
      name: 'auth-setup',
      testMatch: /.*\.setup\.ts/,
    },
    // Step 2: Main test suite dependent on the setup project
    {
      name: 'e2e-tests',
      dependencies: ['auth-setup'],
      use: { browserName: 'chromium' },
    },
  ],
});
```

## 2. Create the Auth setups (auth.setup.ts) [12, 13, 14] 


``` typescript
import { test as setup } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
// Save sessions to distinct locationsexport const ADMIN_AUTH = '.auth/admin.json';export const CUSTOMER_AUTH = '.auth/customer.json';

setup('Setup Admin Session', async ({ page }) => {
  const login = new LoginPage(page);
  await login.navigate();
  await login.login('admin_user', 'admin_pass');
  await page.waitForURL('**/admin/dashboard');
  await page.context().storageState({ path: ADMIN_AUTH });
});

setup('Setup Customer Session', async ({ page }) => {
  const login = new LoginPage(page);
  await login.navigate();
  await login.login('customer_user', 'customer_pass');
  await page.waitForURL('**/customer/dashboard');
  await page.context().storageState({ path: CUSTOMER_AUTH });
});
```

## 3. Build Role-Based Fixtures (fixtures.ts) [15] 
Instead of using the default unauthenticated page, you spin up standalone browser contexts initialized with the saved states.

``` typescript
import { test as base, expect } from '@playwright/test';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
type RoleFixtures = {
  adminPage: AdminDashboard;
  customerPage: CustomerDashboard;
};
export const test = base.extend<RoleFixtures>({
  // Custom fixture that provides a pre-authenticated Admin page
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: '.auth/admin.json' });
    const page = await context.newPage();
    await use(new AdminDashboard(page));
    await context.close();
  },

  // Custom fixture that provides a pre-authenticated Customer page
  customerPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: '.auth/customer.json' });
    const page = await context.newPage();
    await use(new CustomerDashboard(page));
    await context.close();
  },
});
```

## 4. Clean Test Spec Example

``` typescript
import { test } from './fixtures';

test('Admin can view system logs', async ({ adminPage }) => {
  await adminPage.navigateToLogs();
  // adminPage is already logged in as Admin
});

test('Customer can view account balance', async ({ customerPage }) => {
  await customerPage.navigateToBalances();
  // customerPage is already logged in as Customer
});
```

------------------------------
## Approach 2: The Pure Fixture-Based Approach (UI Login Per Test)
If your app uses strict temporary tokens, non-exportable sessionStorage, or dynamic OTP configurations that prevent session saving, you must log in on-the-fly inside the fixture runtime.
## 1. Build the Dynamic Login Fixtures (fixtures.ts)
Every time a test requests adminPage or customerPage, the fixture takes an empty page, runs the UI login steps, and hands the authenticated page to the test block.

``` typescript
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';

type DynamicRoleFixtures = {
  adminPage: AdminDashboard;
  customerPage: CustomerDashboard;
};
export const test = base.extend<DynamicRoleFixtures>({
  adminPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.navigate();
    await login.login('admin_user', 'admin_pass');
    
    // Pass the actively logged-in page object to the test spec
    await use(new AdminDashboard(page));
  },

  customerPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.navigate();
    await login.login('customer_user', 'customer_pass');
    
    await use(new CustomerDashboard(page));
  },
});
```

## 2. Clean Test Spec Example
The test spec syntax looks identical to Approach 1, making it highly modular.

``` typescript
import { test } from './fixtures';

test('Admin can manage system settings', async ({ adminPage }) => {
  // UI login ran behind the scenes before hitting this block
  await adminPage.openSettings(); 
});
```

------------------------------
## Architectural Verdict

| Metric | storageState Approach | Pure Fixture Approach |
|---|---|---|
| Execution Speed | 🚀 Fast (Logins happen once globally) | 🐢 Slow (Logins repeat on every test) |
| Server Load | 🟢 Low (Fewer authentication hits) | 🔴 High (Hammering login endpoints) |
| MFA Compatibility | 🟡 Complex (Requires API or seed bypasses) | 🟢 Easier (Can read UI elements directly) |

If you are interested, let me know if your backend supports a Direct API Login alternative that can be injected into the Pure Fixture Approach to speed it up without local storage files.


