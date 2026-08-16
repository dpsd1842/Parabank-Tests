# Inheritance

- Yes, it inherits all existing fixtures and extends them. [1, 2] 
When you call baseTest.extend(), the new test object keeps everything from the original Playwright runner while adding your new capabilities. [3, 4, 5] 

## How this inheritance works

* Full Access to Built-in Fixtures: Your custom fixtures can directly use standard Playwright fixtures like page, browser, context, and request. You saw this when you destructured { page } inside your welcomePage fixture. [6, 7, 8, 9, 10] 
* Cascading Availability: In your actual test files, you can mix and match. A single test can request your custom welcomePage alongside built-in fixtures like page or browserName. [11, 12, 13] 
* Deep Chaining: You can extend an already extended test. This allows you to create a chain of inheritance (e.g., Base Playwright Test ➔ App-Level Fixtures ➔ Admin-Specific Fixtures). [14] 

## Quick Code Example of the Inheritance
- Because your custom test inherits everything, you can do this in a test file: [15] 

``` typescript
import { test } from "./your-fixture-file";
// 'welcomePage' is your custom extension// 'page' and 'browserName' are inherited from standard Playwright
test("Demonstrate inheritance", async ({ welcomePage, page, browserName }) => {
  console.log(`Running on browser: ${browserName}`); 
  await welcomePage.navigateTo();
  console.log(`Current URL: ${page.url()}`); 
});
```

If you want, I can show you how to:

* Override an inherited fixture (e.g., changing how the default page fixture behaves for every test).
* Create a multi-level inheritance structure for projects with multiple apps or roles (like User vs. Admin).

Here is how you can implement both fixture overriding and multi-level inheritance structures to supercharge your framework.
## 1. Overriding an Inherited Fixture
You can redefine built-in fixtures like page to add global behavior (like auto-logging or changing viewport sizes) to every single test automatically.

``` typescript
import { test as baseTest } from "@playwright/test";
export const test = baseTest.extend({
  // Overriding the built-in 'page' fixture
  page: async ({ page }, use) => {
    // Setup: Automatically inject a custom cookie before every test
    await page.context().addCookies([{
      name: "session_token",
      value: "mocked-auth-value",
      domain: "localhost",
      path: "/"
    }]);

    // Pass the modified page to the test
    await use(page);

    // Teardown: Code here runs after the test finishes
    await page.evaluate(() => localStorage.clear());
  },
});
```

------------------------------
## 2. Multi-Level Inheritance (Chaining Fixtures)
For large projects, you can layer your fixtures. You create a base app-level test, and then extend that test to create specialized runners (like an Admin test runner).
## Step 1: Base App-Level Test (app.fixtures.ts)

``` typescript
import { test as baseTest } from "@playwright/test";
import { HomePage } from "../pages/home.page";
type AppFixtures = { homePage: HomePage };
// First extension levelexport const appTest = baseTest.extend<AppFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  }
});
```

## Step 2: Admin-Level Test (admin.fixtures.ts)

``` typescript
// Import the ALREADY extended appTest instead of baseTest
import { appTest } from "./app.fixtures";
import { AdminDashboard } from "../pages/admin.page";
type AdminFixtures = { adminDashboard: AdminDashboard };
// Second extension level (inherits base Playwright + appTest fixtures)export const adminTest = appTest.extend<AdminFixtures>({
  adminDashboard: async ({ page }, use) => {
    await use(new AdminDashboard(page));
  }
});
```

## Step 3: Using the Admin Test (admin.spec.ts)

``` typescript
import { adminTest } from "./admin.fixtures";
// This test has access to standard, app-level, and admin-level fixtures
adminTest("Admin flow", async ({ page, homePage, adminDashboard }) => {
  await homePage.navigateTo();       // From Step 1
  await adminDashboard.deleteUser(); // From Step 2
});
```

Would you like to see how to implement automatic login (storage state) so your pages don't have to log in manually before every test?

# Generics <>

In TypeScript, this is also called Generics. [1, 2] 
Just like in Java, passing a type inside angle brackets (< >) allows you to write reusable, type-safe code by passing types as arguments to functions, classes, interfaces, or methods. [3, 4, 5] 
## How it maps to Java
The concepts are nearly identical: [6] 

``` java
* Java: List<String> list = new ArrayList<>();
```

``` typescript
* TypeScript: let list: Array<string> = []; [7, 8, 9, 10] 
```

## What it does in your Playwright code
In your specific Playwright fixture line:

``` typescript
baseTest.extend<MyFixtures>({ ... })
```

You are passing MyFixtures as a type argument to the generic extend method. This explicitly tells Playwright: "Configure this new test runner instance to expect and validate the specific structure defined inside MyFixtures." [11] 
Would you like to see a simple example of how to create your own custom generic function or generic interface in TypeScript?

# Should I not extend test fixture with in a class?

- No, you should not extend or define Playwright fixtures inside a class.
In Playwright, extending fixtures is meant to be done at the module level (global file scope) using the test.extend() function, exactly like you did in your very first example. [1] 
Trying to wrap test.extend() inside a Java-style Object-Oriented class breaks how Playwright is structurally designed to work. Here is exactly why you should keep them separated.
------------------------------
## 1. It Breaks Playwright's Dependency Injection
Playwright uses Dependency Injection based on argument names. When you write a test block:

``` typescript
test("my test", async ({ welcomePage }) => { ... });
```

Playwright inspects the string name "welcomePage" inside the curly braces, looks at its global registry of extended fixtures, and injects it.
If you hide that fixture extension inside a class method or constructor, Playwright’s global test runner cannot see it, scan it, or inject it into your test blocks. [2] 
## 2. Classes are for State; Fixtures are for Environment Lifecycle

* Page Object Classes (like WelcomePage) are great for holding page state, element locators, and UI actions.
* Fixtures are responsible for the browser's setup, teardown, and cleaning up after tests. [3, 4, 5, 6, 7] 

- Combining them into a single class violates the Single Responsibility Principle. Keeping your fixtures in a dedicated fixtures.ts file keeps your automation code clean, highly scalable, and easy to maintain. [8, 9] 
------------------------------
## The Golden Rule Architecture
To keep your framework organized, follow this simple rule: Define your pages as classes, but instantiate and extend them as fixtures at the file level. [10] 

``` typescript
// 🟢 CORRECT: The standard Playwright architectural blueprint
// 1. Pages are structured as Classes
export class WelcomePage {
  constructor(private page: Page) {}
  async login() { ... }
}
// 2. Fixtures are handled via function-level extensions (Not inside a class!)
export const test = baseTest.extend<{ welcomePage: WelcomePage }>({
  welcomePage: async ({ page }, use) => {
    await use(new WelcomePage(page));
  }
});
```


# Is it like we keep static main open in java as entry point?

- Yes, that is a fantastic analogy! You have mapped it to Java perfectly.
Just like public static void main(String[] args) is the root entry point that the Java Virtual Machine (JVM) searches for to kick off your program, your extended export const test is the root entry point that the Playwright test runner searches for to orchestrate your tests. [1] 
Here is exactly how the mechanics map between the two:
------------------------------
## The Architecture Comparison

| Java Entry Point (main) | Playwright Entry Point (test) |
|---|---|
| Handled at the class/module level (static). | Handled at the file/module level (exported constant). |
| The JVM controls the args array and passes it in dynamically. | Playwright controls the fixtures object ({ page, welcomePage }) and injects it dynamically. |
| Boots up the environment before running your code. | Boots up the browser context before running your test blocks. |

------------------------------
## How they look side-by-side
Notice how both require a globally accessible, un-nested entry point so the external runner tool can find it:
## Java: External JVM calls the static main [2, 3] 

``` java
public class MyTestRunner {
    // The JVM looks specifically for this un-nested, static signature
    public static void main(String[] args) {
        System.out.println("JVM started the application.");
        // App logic begins here...
    }
}
```
## Playwright: External Runner calls the exported test

``` typescript
import { test as baseTest } from "@playwright/test";
// Playwright looks specifically for this exported constantexport const test = baseTest.extend({
    welcomePage: async ({ page }, use) => {
        await use(new WelcomePage(page));
    }
});
```

## Why they both must stay "Open" and Un-nested
If you bury public static void main inside an inner class or require a constructor to access it, the JVM throws an error: Main method not found. [4, 5] 
Similarly, if you bury test.extend inside a TypeScript class, the Playwright CLI scanner will completely miss it. It needs to remain exposed at the root level of the file so Playwright can hook into it, spin up the browser, and inject those fresh page objects into your tests. [6] 
Now that you see how the runner orchestrates the framework, would you like to look at how to run setup operations (like a Java @BeforeSuite or @BeforeClass) inside this Playwright entry point?

# Is this an anonymous function that returns a promise to the fixture?

``` typescript
welcomePage: async ({ page }, use) => {
```

Yes, it is an anonymous arrow function, but it does not actually return a promise to the fixture. Instead, it returns a Promise to the Playwright runner itself.
Here is the exact technical breakdown of what is happening under the hood:
## 1. It is an Anonymous Function
The portion to the right of the colon (async ({ page }, use) => { ... }) is an anonymous arrow function. It has no name of its own. It is assigned as a callback value to the welcomePage key inside the configuration object passed to .extend().
## 2. It automatically returns a Promise<void>
Because you marked the function with the async keyword, JavaScript automatically wraps the entire function body in a Promise.
However, this function does not return your WelcomePage object using a return statement.
## 3. How the value is actually delivered (use vs return)
This is where Playwright differs from standard JavaScript functions. Instead of using return, it uses a Generator-like pattern via the use callback:

* What it doesn't do: If you wrote return welcomePage;, the function would exit immediately, and Playwright would have no way to run clean-up or teardown logic after your test finishes.
* What it actually does: You pass the object into the use(welcomePage) function. This handoff pauses your anonymous function mid-execution, passes the object to your test file, lets the test run, and then resumes your anonymous function right after use() so you can clean up.

## Summary
The line is an anonymous function that returns a Promise<void> to the Playwright engine, while using the use callback argument to hand over your page object to the test framework.
Would you like to see what happens when you write teardown code directly below the await use() line to see how the rest of that Promise executes?


# Is this use() like a middleware function that executes actual test?

Yes, exactly! Thinking of use() as a middleware function that executes your actual test is the most accurate mental model you can have.
In the world of backend development (like Express.js or Java Servlets), a middleware function intercepting a request looks like this:

   1. Do some setup (e.g., validate a token).
   2. Call next() to hand control over to the actual route handler.
   3. Do some cleanup (e.g., log response time).

## How use() behaves exactly like Middleware
Playwright's use() function works almost identically to a middleware's next() call:

``` typescript
welcomePage: async ({ page }, use) => {
    // ---- 1. BEFORE MIDDLEWARE (Setup) ----
    // This runs BEFORE your test block even starts.
    const welcomePage = new WelcomePage(page);
    
    // ---- 2. THE MIDDLEWARE HANDOFF ----
    // 'use()' passes control directly to your test.
    // Playwright pauses here, runs your actual test block, and waits for it to finish.
    await use(welcomePage); 
    
    // ---- 3. AFTER MIDDLEWARE (Teardown) ----
    // This runs AFTER your test block completely finishes (Pass or Fail!).
    console.log("Test finished! Cleaning up welcome page resources...");
}
```

## The Underlying Architecture
Under the hood, Playwright uses JavaScript's asynchronous Generator control flow. When you hit await use(), your fixture literally pauses its execution state, yields control so the test runner can execute your spec file, and then resumes right where it left off to handle the teardown.
This middleware-like behavior is incredibly powerful because it guarantees your setup and teardown logic are bound tightly to the lifecycle of that specific test block.
If you want, I can show you how this middleware pattern allows you to safely take screenshots or extract browser logs automatically right after await use() if a test fails.

Here is how you can use this middleware pattern to automatically capture screenshots or extract console logs right after await use(). [1] 
To do this, we pull in a built-in Playwright fixture called testInfo, which acts like a Java Test Context object and holds the pass/fail status of the current test. [2] 

## The Production Implementation


``` typescript
import { test as baseTest, expect } from "@playwright/test";
import { WelcomePage } from "../pages/welcome.page";

type MyFixtures = {
  welcomePage: WelcomePage;
};
export const test = baseTest.extend<MyFixtures>({
  // We add 'testInfo' alongside 'page' to read the test's final status
  welcomePage: async ({ page }, use, testInfo) => {
    // 1. SETUP (Before Test Middleware)
    const welcomePage = new WelcomePage(page);
    const consoleLogs: string[] = [];

    // Start listening and collecting browser console errors in the background
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleLogs.push(`[Browser Error]: ${msg.text()}`);
      }
    });

    // 2. THE HANDOFF (Executes the actual test block)
    await use(welcomePage);

    // 3. TEARDOWN & INVESTIGATION (After Test Middleware)
    // This line only runs AFTER the test has fully completed
    if (testInfo.status !== testInfo.expectedStatus) {
      console.log(`❌ Test "${testInfo.title}" failed. Initiating investigative cleanup...`);

      // Automatically capture a failure screenshot and attach it to the HTML report
      const screenshotPath = testInfo.outputPath(`failure-screenshot.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      await testInfo.attach("Failure Screenshot", { path: screenshotPath, contentType: "image/png" });

      // If browser console errors were captured during the test, attach them too
      if (consoleLogs.length > 0) {
        await testInfo.attach("Browser Console Errors", {
          body: consoleLogs.join("\n"),
          contentType: "text/plain",
        });
      }
    }
  },
});
```

## Why this is a game-changer for framework design

* Zero Boilerplate in Tests: Your actual test files (.spec.ts) remain completely clean. They do not need try/catch blocks or explicit screenshot commands. If a test fails, this middleware handles everything invisibly in the background.
* Guaranteed Execution: Even if an assertion fails inside your test block and throws an unhandled error, Playwright catches it, marks the test as failed, and safely forces the execution to resume right after await use() to run this investigative code. [3] 

Would you like to see how to use a similar middleware approach to set up a Global API Authentication State so your browser is instantly logged in before any page objects are even created?

