# Database Validations
- Playwright does not have any built-in database connectors. [1] 
- Because Playwright is designed strictly as a browser automation and HTTP testing engine, it does not bundle database clients inside its core library. [2, 3] 
- However, since your Playwright project is built with Node.js and TypeScript, you have direct access to the entire Node.js backend ecosystem. You do not need complex third-party testing wrappers; you simply install the official, native database driver packages directly into your project via npm. [4, 5, 6, 7] 
------------------------------
## 🛠️ Popular Database Drivers for Playwright
Depending on what database your application (like Parabank) uses behind the scenes, you can add the exact matching driver:

``` shell
* PostgreSQL: npm install pg (with @types/pg for TypeScript safety)
* MySQL: npm install mysql2
* SQL Server (MSSQL): npm install mssql
* MongoDB: npm install mongodb [8] 
```

------------------------------
## 🚀 Step-by-Step Implementation: Database Validations in Playwright
Here is a clean, production-ready example of how to handle database connections and assertions directly inside a Playwright test script using a relational database driver.
## Step 1: Create a Database Utility Helper
Create a utility file to manage your connection pooling safely without cluttering your test specs.

``` typescript
// utils/db.tsimport pg from 'pg';
// Create a connection pool using environment variablesexport const dbPool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'parabank_user',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'parabank',
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
});
// Helper function to execute clean, typed queriesexport async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const res = await dbPool.query(text, params);
  return res.rows;
}
```

## Step 2: Use the DB Helper Inside Your Test
You can integrate database validation scripts before or after your browser interaction loops.

``` typescript
// tests/registration.spec.tsimport { test, expect } from '@playwright/test';import { query, dbPool } from '#utils/db'; // Using your clean subpath imports
// Ensure database connections clean up completely when all tests finish running
test.afterAll(async () => {
  await dbPool.end();
});

test('Validate user registration details in DB after UI submission', async ({ page }) => {
  const uniqueUsername = `user_${Date.now()}`;

  // 1. Perform UI Registration Actions
  await page.goto('/register.htm');
  await page.locator('#username').fill(uniqueUsername);
  await page.locator('#password').fill('SecurePass123!');
  await page.locator('button[type="submit"]').click();
  
  // Verify UI success state
  await expect(page.locator('.welcome-message')).toBeVisible();

  // 2. Perform Database Validation (The Backend Verification)
  const dbResult = await query(
    'SELECT username, is_active FROM users WHERE username = $1', 
    [uniqueUsername]
  );

  // Assert that exactly one record exists matching our registration
  expect(dbResult.length).toBe(1);
  expect(dbResult[0].username).toBe(uniqueUsername);
  expect(dbResult[0].is_active).toBe(true);
});
```

------------------------------
## 💡 Best Practices for Database Validations in Playwright

   1. Use Connection Pools (Pool): Do not open and close a raw single database connection for every single test case. A pool automatically keeps a set of connections open and recycles them across parallel tests, boosting performance. [9, 10] 
   2. Parametrize Your Queries: Always use positional arguments ($1, $2 or ?) instead of string interpolation to prevent accidental SQL injection or data format breaks during test runs. [11] 
   3. Leverage Custom Fixtures: If your test suites require heavy database state preparation (e.g., seeding a specific bank account with a clean transaction balance before a test starts), you can wrap your database query calls inside a custom Playwright Fixture.

## References

[1] [https://visualpathblogs.com](https://visualpathblogs.com/playwright-automation/how-can-i-connect-to-database-using-playwright/)
[2] [https://www.rocksoft.pl](https://www.rocksoft.pl/blog/end-to-end-testing-with-playwright)
[3] [https://www.aegissofttech.com](https://www.aegissofttech.com/insights/playwright-automation-tutorial/)
[4] [https://testrig.medium.com](https://testrig.medium.com/playwrights-architecture-and-how-it-stands-apart-from-selenium-cypress-26ac2bc49b32)
[5] [https://community.sisense.com](https://community.sisense.com/blog/blog_productreleases/sisenses-journey-to-automated-testing-with-playwright/21980/replies/26110/)
[6] [https://www.linkedin.com](https://www.linkedin.com/pulse/getting-started-playwright-beginners-guide-modern-testers-testleaf-jc0yc)
[7] [https://www.qable.io](https://www.qable.io/blog/playwright-testing)
[8] [https://www.testrigtechnologies.com](https://www.testrigtechnologies.com/advanced-end-to-end-testing-validating-supabase-data-with-playwright/)
[9] [https://www.thegreenreport.blog](https://www.thegreenreport.blog/articles/database-rollback-strategies-in-playwright/database-rollback-strategies-in-playwright.html)
[10] [https://medium.com](https://medium.com/@thealokkumarsingh/how-to-validate-user-input-in-node-js-a-step-by-step-guide-6993f39a914a)
[11] [https://firebase.blog](https://firebase.blog/posts/2026/03/fdc-native-sql/)
