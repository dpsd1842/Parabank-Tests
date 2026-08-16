# Hooks Equivalents

If I have some logic other than login that needs to be executed before every test, do I have to call it in every fixture? is there a similar approach like cucumber hooks?

- You do not have to copy-paste that logic into every single fixture.
Playwright provides a built-in approach that mirrors Cucumber Hooks (like @Before or @BeforeEach) by using automatic fixtures (declared with auto: true) or standard test.beforeEach blocks. [1, 2, 3] 
Here are the two best ways to execute global logic before every single test without duplicating code.
------------------------------
## Approach 1: The "Cucumber Hook" Style (Automatic Fixture)
- If you add { auto: true } to a fixture configuration, Playwright will automatically execute that fixture before every single test in your suite, even if the test file never explicitly requests or names it. [4, 5] 
This is the exact structural equivalent to a Cucumber @Before hook.

``` typescript
import { test as baseTest } from "@playwright/test";
export const test = baseTest.extend({
  // This fixture runs automatically for every single test
  globalSetupHook: [async ({ page }, use) => {
    // 1. SETUP: This runs BEFORE every test (Like Cucumber @Before)
    console.log("🧹 Running Global Setup: Clearing cookies & setting up environment...");
    await page.context().clearCookies();
    await page.goto("https://my-app-base-url.com");

    // 2. MIDDLEWARE HANDOFF: Pauses here to let the actual test run
    await use();

    // 3. TEARDOWN: This runs AFTER every test (Like Cucumber @After)
    console.log("📝 Global Teardown: Saving audit logs...");
  }, { auto: true }] // 👈 The magic keyword that flags it as a hook
});
```

------------------------------
## Approach 2: The Java/TestNG Style (test.beforeEach)
- If your setup logic is specific to a particular set of tests or a specific file (similar to JUnit's @BeforeEach or TestNG's @BeforeMethod), you can use Playwright’s native hooks. [6, 7, 8, 9] 
By importing your custom test entry point, your hooks automatically get full access to your custom page object fixtures.

``` typescript
// my-test-suite.spec.ts
import { test, expect } from "./your-fixture-file";
// This hook runs before every test block inside this file
test.beforeEach(async ({ welcomePage, page }) => {
    console.log("⚡ Executing file-level setup hook...");
    await welcomePage.navigateTo();
    await page.evaluate(() => localStorage.setItem("feature_flag", "true"));
});

test("Test One", async ({ homePage }) => {
    // Both globalSetupHook AND the beforeEach hook have already executed here
    await expect(homePage.dashboardHeader).toBeVisible();
});

test("Test Two", async ({ homePage }) => {
    // Fresh setup executed again for this test
    await expect(homePage.profileButton).toBeVisible();
});
```

## Which one should you use?

* Use Approach 1 (Auto-Fixtures) if the logic must run globally for every single test across your entire framework (e.g., clearing browser state, injecting tracking tokens, or database seeding triggers).
* Use Approach 2 (beforeEach hooks) if the logic is localized to a specific feature file or a specific folder group of tests. [10, 11] 

Would you like to see how to organize your global configuration variables (like environment endpoints or testing tokens) using Playwright's playwright.config.ts file alongside these hooks?

# Why is this globalSetupHook is an array unlike other fixtures, is it only because of auto:true? this also returns promise<void>?

- Yes, it is an array specifically because of { auto: true }, and yes, it still returns a Promise<void> under the hood.
Here is the exact explanation of why this syntax changes and how Playwright parses it.
------------------------------
## 1. Why the Array Syntax?
Normally, when you define a fixture, you pass a single value (the anonymous function): [1] 

``` typescript
welcomePage: async ({ page }, use) => { ... }
```

- However, a standard key-value pair only allows you to pass one thing: the function itself. [2, 3] 
To pass configuration options about that fixture (like telling Playwright to run it automatically, or setting its execution scope), Playwright requires you to change the value into a tuple array. [4, 5] 

* Index 0: The actual asynchronous fixture/middleware function.
* Index 1: A configuration options object ({ auto: true } or { scope: 'worker' }).

``` typescript
// Think of it as: fixtureName: [ actualFunction, configurationOptions ]
globalSetupHook: [
  async ({ page }, use) => { ... }, 
  { auto: true }
]
```

------------------------------
## 2. Does it still return a Promise<void>?
- Yes, absolutely.
The behavior of the function inside index 0 does not change at all. Because it is marked as async, it still returns a Promise<void> to the Playwright test runner.
The only difference is that you are calling use() without passing an object inside it (e.g., await use()).

* In your welcomePage fixture, you ran await use(welcomePage) because your test files needed to consume that page object.
* In a global hook fixture, you just run await use() as a blank signal. It tells Playwright: "The setup is done, go ahead and execute the test now. I don't have an object to give you, I just wanted to run this setup code." [6] 

Would you like to look at how to use this exact same array syntax to change a fixture's scope from 'test' to 'worker' (which lets you run a setup block once per CPU core rather than once per test, similar to Java's @BeforeClass)?


# Show other equivalents of @AfterTest, @BeforeStep, @AfterStep, @BeforeClass etc..

- To handle test lifecycles similarly to Java frameworks (like TestNG/JUnit) or BDD frameworks (like Cucumber), Playwright uses a combination of native test hooks and fixtures. [1, 2, 3] 
Here is how you map every Java/Cucumber annotation directly to its Playwright equivalent.
------------------------------
## 1. The Core Lifecycle Equivalents

| Java / Cucumber Annotation | Playwright / TypeScript Equivalent | Execution Timing |
|---|---|---|
| @BeforeSuite / @BeforeAll | test.beforeAll() (Global configuration file) | Runs once before all tests across the entire project starts. |
| @BeforeClass | test.beforeAll() (Inside a spec file) | Runs once before the current test file or description block starts. |
| @BeforeTest / @BeforeEach | test.beforeEach() | Runs before every individual test inside that file. |
| @BeforeStep | Destructuring setup in an automatic fixture | Runs before every individual action inside a fixture context. |
| @AfterStep | Teardown block in an automatic fixture | Runs after every individual action inside a fixture context. |
| @AfterTest / @AfterEach | test.afterEach() | Runs after every individual test finishes. |
| @AfterClass | test.afterAll() (Inside a spec file) | Runs once after the current test file or description block finishes. |
| @AfterSuite / @AfterAll | test.afterAll() (Global configuration file) | Runs once after all tests across the entire project finish. |

------------------------------
## 2. Code Implementations## File-Level Class and Test Hooks (@BeforeClass, @AfterClass, @BeforeTest, @AfterTest) [4, 5] 
- If you want to isolate your hooks to a single test suite or file, put them directly in your test file (.spec.ts):
    
``` typescript
import { test, expect } from "./your-fixtures";

test.describe("User Management Suite", () => {

  //  Equivalent to: @BeforeClass
  test.beforeAll(async () => {
    console.log("🚀 Setting up database connection for this file...");
  });

  //  Equivalent to: @BeforeTest / @BeforeEach
  test.beforeEach(async ({ page, welcomePage }) => {
    console.log("🔌 Clearing browser context cookies...");
    await page.context().clearCookies();
    await welcomePage.navigateTo();
  });

  test("Delete user profile", async ({ homePage }) => {
    await homePage.deleteProfile();
  });

  //  Equivalent to: @AfterTest / @AfterEach
  test.afterEach(async ({ page }, testInfo) => {
    console.log(`📝 Finished test: ${testInfo.title} with status: ${testInfo.status}`);
  });

  //  Equivalent to: @AfterClass
  test.afterAll(async () => {
    console.log("🛑 Closing database connection for this file...");
  });
});
```

## Step-Level Hooks (@BeforeStep, @AfterStep) [6] 
- Because Playwright doesn't inherently use "steps" like a BDD Gherkin file, it handles step execution behavior through Fixture Wrappers or test.step() encapsulation.
If you want to track or intercept everything that happens during an action block:

``` typescript
import { test as baseTest } from "@playwright/test";
export const test = baseTest.extend({
  // Automatic step-interceptor fixture
  stepTracker: [async ({ page }, use) => {
    // 1. Equivalent to: @BeforeStep
    console.log("📸 [Before Step]: Formatting viewport layout...");

    await use(); // Runs the actual lines inside your test

    // 2. Equivalent to: @AfterStep
    console.log("📸 [After Step]: Verification complete. Checking console errors...");
  }, { auto: true }]
});
```

Inside your test file, you wrap logic using test.step to explicitly segregate your execution blocks: [7, 8] 

``` typescript
import { test } from "./step-fixture-file";

test("End to end checkout flow", async ({ page, homePage }) => {
  // Each test.step acts like a Cucumber Step definition block
  await test.step("Given the user searches for an item", async () => {
    await homePage.searchForItem("Laptop");
  });

  await test.step("When the user adds it to the cart", async () => {
    await homePage.addToCart();
  });
});
```
