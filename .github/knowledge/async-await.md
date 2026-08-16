# async - await

- This is one of the most common points of confusion for developers coming from languages like Java!
Even though JavaScript's engine is inherently asynchronous and non-blocking under the hood, you still must explicitly label a function with async to use await for two primary reasons: syntax parsing and runtime stack behavior. [1, 2, 3] 
------------------------------
## 1. It Tells the JavaScript Parser How to Read the Code

- If JavaScript allowed you to use await anywhere without an async wrapper, the engine's parser wouldn't know how to interpret the keyword.
- Before async/await was introduced, await was just a normal variable name people used in their code (const await = true;). By forcing you to write async function, you explicitly flag that specific block of code, telling the engine: "Heads up! The word await inside this specific block is now a reserved structural keyword, not a variable name." [4, 5, 6, 7, 8] 
------------------------------
## 2. It Pauses the Function, Not the Entire Thread
- JavaScript is single-threaded. When a function hits an await statement, JavaScript needs to freeze that specific function's execution state and immediately jump out of it to run other background tasks (like animations, network events, or other tests). [9, 10, 11, 12, 13] 

* The async keyword transforms that function into a state machine under the hood.
* When you hit await, the function saves its local variables, pauses its own internal execution, and instantly yields control back to the main thread.
* Without the async boundary, JavaScript wouldn't know where the "pausable" scope begins and ends. [14, 15, 16, 17] 

------------------------------
## A Structural Visual Example
Look at how JavaScript acts when it encounters an async boundary:

``` typescript
function standardTask() {
    console.log("1. I run instantly");
}
async function automationTask(page) {
    console.log("2. I start running");
    
    // The engine hits 'await'. It pauses THIS function, exits it, 
    // and goes to run 'standardTask()' while the browser navigates.
    await page.goto("https://example.com"); 
    
    console.log("4. I finally run after the page loads");
}

automationTask(page);
standardTask(); 
console.log("3. I run while the browser is still loading in step 2!");
```

## Exceptions to the Rule: Top-Level Await
In modern TypeScript (and modern JavaScript modules), you can actually use await without an async function, but only at the very root level of a file (Top-Level Await). [18, 19, 20, 21] 

``` typescript
// inside global-config.ts (No async function wrapper needed here!)
import { chromium } from "@playwright/test";
// This is allowed at the root level of a module file
const browser = await chromium.launch(); 
export { browser };
```
However, inside any nested blocks, methods, Page Objects, or test() declarations, the explicit async marker remains strict and mandatory.
Would you like to look at how Playwright utilizes this non-blocking behavior to run hundreds of test files completely in parallel on a single machine?

# Lets say if we have two functions with and without async-await, when we call these in another class, what happens to the execution line by line

- To understand exactly how JavaScript executes this line-by-line, we have to look at the return values.
When a function does not use async/await, it executes synchronously and blocks the line until it is done. When a function does use async, it instantly returns a Promise object and moves to the next line immediately, unless you explicitly tell the calling class to await it. [1, 2, 3, 4, 5] 
Here is a step-by-step breakdown of exactly what happens at runtime.
------------------------------
## The Setup: Two Functions in a Service Class

``` typescript
// HelperService.ts
export class HelperService {
    // 1. Regular synchronous function (No async)
    doHeavyMath() {
        console.log("   👉 Running Math calculation...");
        return 5 + 5; 
    }

    // 2. Asynchronous function (Returns a Promise)
    async fetchBrowserData(page: any) {
        console.log("   👉 Starting network request...");
        await page.goto("https://example.com"); // Pauses HERE, yields control
        console.log("   👉 Network request finished!");
        return "Data Loaded";
    }
}
```
------------------------------
## Scenario A: Calling them WITHOUT using await in the main class
If your main class calls both functions sequentially but forgets or omits the await keyword, JavaScript treats them as non-blocking fires.

``` typescript
// MainTest.ts
import { HelperService } from "./HelperService";
const service = new HelperService();

console.log("1. Test Started");
// Line 1: Executes instantly, finishes, returns the raw number 10.const result1 = service.doHeavyMath(); 
console.log(`2. Math Result is: ${result1}`);
// Line 2: Starts the function, hits the internal 'await', // INSTANTLY returns an unfulfilled Promise object, and jumps to Line 3!const result2 = service.fetchBrowserData(page); 
console.log(`3. Browser Result is: ${result2}`); // ❌ Prints: "[object Promise]"

console.log("4. Test Ended");
```
## ⏱️ The Exact Execution Output Order for Scenario A:

   - 1. Test Started
   - 👉 Running Math calculation...
   - 2. Math Result is: 10
   - 👉 Starting network request... (Stops at page.goto and yields)
   - 3. Browser Result is: [object Promise] (Moved on immediately!)
   - 4. Test Ended
   - 👉 Network request finished! (Prints long after the test "ended")

------------------------------
## Scenario B: Calling them WITH await in the main class
To make your test execute in a predictable, strict line-by-line order (like Java), you must wrap the execution in an async block and use await. [6, 7] 

``` typescript
// MainTest.ts
async function runSequentialTest() {
    console.log("1. Test Started");

    // Line 1: Executes instantly, returns 10. (No await needed, it's not a Promise)
    const result1 = service.doHeavyMath(); 
    console.log(`2. Math Result is: ${result1}`);

    // Line 2: Starts the function. Hits 'await'. The entire 'runSequentialTest' 
    // function pauses right here until the browser finishes loading.
    const result2 = await service.fetchBrowserData(page); 
    
    // Line 3: Only executes AFTER the promise above resolves.
    console.log(`3. Browser Result is: ${result2}`); //  Prints: "Data Loaded"

    console.log("4. Test Ended");
}
```

## ⏱️ The Exact Execution Output Order for Scenario B:

   - 1. Test Started
   - 👉 Running Math calculation...
   - 2. Math Result is: 10
   - 👉 Starting network request...
   - 👉 Network request finished! (Paused and waited here)
   - 3. Browser Result is: Data Loaded
   - 4. Test Ended

## Key Takeaway for Java Developers

* Calling a non-async function is like calling a standard Java method.
* Calling an async function without await is like firing a Java CompletableFuture without calling .get() or .join(). It triggers the background thread but your main code keeps running right past it. [8, 9] 

Would you like to see how Playwright uses this exact behavior to implement auto-waiting locators, meaning you rarely have to write manual waits for elements to appear?

# Will js execute above function test line by line or in parallel?

``` typescript
function test(){
    veryLongRuuningOp();
    longRunningOp();
    quickOp();
}
```

- JavaScript will execute the test() function line-by-line (sequentially), not in parallel.
However, whether the tasks actually block each other or kick off background processes depends entirely on whether those operations are synchronous or asynchronous.
Here are the two ways this plays out based on how those functions were written:
------------------------------
## Case 1: If they are Synchronous (Blocking)
If these functions are pure JavaScript calculations (like sorting a massive array or running a huge for loop), JavaScript executes them strictly line-by-line.
Each line must completely finish before the next line can even begin.

``` typescript
function test() {
  veryLongRunningOp(); // ⏱️ Takes 10 seconds. JS freezes here for 10 seconds.
  longRunningOp();     // ⏱️ Starts at second 10. Takes 5 seconds.
  quickOp();           // ⏱️ Starts at second 15. Takes 0.1 seconds.
}// Total time: 15.1 seconds
```

------------------------------
## Case 2: If they are Asynchronous (Non-Blocking Promises)
If these functions trigger external web/browser operations (like page.goto(), database queries, or API requests) and return Promises, JavaScript still reads them line-by-line, but it executes them like a chain reaction.
Because there is no await keyword, JavaScript triggers the first one, immediately moves to the second, and immediately moves to the third without waiting for any of them to finish.

``` typescript
function test() {
  veryLongRunningOp(); //  Kicks off a 10s network request, moves on instantly.
  longRunningOp();     //  Kicks off a 5s network request, moves on instantly.
  quickOp();           //  Kicks off a 0.1s network request, moves on instantly.
}
// All three operations are now running concurrently in the browser background!
// Total time to execute the test() function wrapper: Less than 1 millisecond.
```

- In this scenario, quickOp() will actually finish its background task first, followed by longRunningOp(), and finally veryLongRunningOp(), even though they were triggered line-by-line.
------------------------------
## How to make them wait strictly line-by-line (Sequential)
If you want longRunningOp() to wait until veryLongRunningOp() is completely finished before starting, you must add async/await:

``` typescript
async function test() {
  await veryLongRunningOp(); // ⏱️ Stops here until done
  await longRunningOp();     // ⏱️ Starts only after the above finishes
  await quickOp();           // ⏱️ Starts last
}
```

Would you like to see how to rewrite this specific example using Promise.all() if you explicitly wanted all three of them to fire in parallel and finish as fast as possible?

## It ultimately depends how those functions internally implemented if we dont add await?

Exactly, you nailed it! That is the core secret of JavaScript's runtime.
If you don't use await, the execution behavior depends entirely on whether those internal functions are implemented as Synchronous (CPU-bound) or Asynchronous (I/O-bound/Promises). [1, 2, 3, 4, 5] 
## The Cheat Sheet
Here is a quick reference table of what happens line-by-line when you omit await:

| Internal Implementation | What it returns | What happens to the line execution? |
|---|---|---|
| Synchronous (Loops, Math, File reading) | A raw value (or void) | Blocks. The line freezes until the calculation is 100% finished. |
| Asynchronous (API calls, Playwright actions) | A Promise object | Fires and forgets. It kicks off the background task and moves to the next line immediately. |

## Why this is vital for Playwright Automation
Almost every method in Playwright (like .click(), .fill(), .goto()) is internally implemented as an Asynchronous Promise. [6, 7, 8, 9, 10] 
Therefore, if you omit await in your automation scripts, Playwright will fire off your test actions all at once, leading to broken tests because the browser can't keep up with the script. [11, 12] 

``` typescript
// ❌ Disaster: Playwright kicks off all 3 at the same millisecond!
// The browser will try to click the button before the page even loads.
function loginTest({ page }) {
    page.goto("/login");
    page.locator("#user").fill("admin");
    page.locator("#submit").click();
}
//  Correct: Explicitly forcing the script to wait for the internal promises
async function loginTest({ page }) {
    await page.goto("/login");
    await page.locator("#user").fill("admin");
    await page.locator("#submit").click();
}
```

Would you like to look at how to handle conditional logic in Playwright (e.g., if an element appears, click it; if not, skip it) using these async concepts?

# Similar to java's thread synchronization

- You have made an excellent connection. Conceptually, it is very similar to Java's thread synchronization, but there is one massive architectural difference: Java accomplishes this with multiple threads, while JavaScript does it entirely on a single thread. [1, 2, 3, 4] 
Here is a comparison mapping your Java knowledge directly to how JavaScript achieves the same goal.
------------------------------
## The Conceptual Mapping

| Java Concept (Multi-Threaded) | JavaScript / TypeScript Concept (Single-Threaded) |
|---|---|
| CompletableFuture<T> or Future<T> | Promise<T> |
| .get() or .join() (Blocks the thread) | await (Pauses the function, frees the thread) |
| Thread.sleep(3000) (Freezes everything) | await page.waitForTimeout(3000) (Yields to other events) |
| synchronized block / Locks | The Event Loop (Native microtask queue) |

------------------------------
## Why JS async/await is safer than Java Thread Synchronization
In Java, managing parallel execution or synchronization requires locking mechanisms, threads, or thread pools (ExecutorService). This opens the door to complex bugs: [5, 6, 7, 8, 9] 

* Deadlocks (Threads waiting on each other forever).
* Race Conditions (Two threads mutating the same variable simultaneously). [10, 11, 12] 

In TypeScript, race conditions on memory variables are impossible because your code only ever executes on one single thread. [13, 14] 
## How the mechanisms differ when waiting:

* Java: When you call .get() on a Future or use a synchronized lock, that specific Java thread blocks and freezes. No other code can run on that thread until it is released. [15, 16, 17] 
* JavaScript: When you await a Promise, the thread does not freeze. Instead, the current function pauses, packages itself up, and steps aside. The single thread is immediately freed up to handle other background operations (like network callbacks or other running tests) until the Promise resolves. [18, 19, 20, 21, 22] 

## Summary
You can think of async/await as a highly optimized, developer-friendly syntax for handling synchronous-looking control flow over asynchronous tasks, completely avoiding the overhead and danger of managing raw threads. [23, 24, 25, 26] 
If you want, we can explore:

* How to use test.describe.parallel() in Playwright to run separate test files concurrently.
* How to handle shared state/context safely across tests without running into collision issues.

