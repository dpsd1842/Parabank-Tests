# Promises

A Promise in TypeScript is both a core JavaScript class and a generic TypeScript type (Promise<T>). [1, 2, 3] 
It represents a container for a value that does not exist yet but will resolve in the future. Because web browsers and test runners operate asynchronously (waiting for a network response, page load, or button click), Promises are used to manage that waiting period without freezing the execution of your code. [4, 5, 6, 7, 8] 
------------------------------
## 1. The Promise as a Type
In TypeScript, you use the global generic interface Promise<T> to declare exactly what type of data will eventually be returned when the asynchronous operation completes. [9, 10] 

* Promise<string>: Promises a string value in the future (e.g., getting text from an element).
* Promise<void>: Promises that the action will finish, but it will return no data (like clicking a button).
* Promise<boolean>: Promises a true/false evaluation (like checking if an element is visible). [11, 12, 13, 14, 15] 

// Explicitly stating that this function returns a Promise containing a stringasync function getWelcomeMessage(): Promise<string> {
    return "Welcome Back!"; 
}

------------------------------
## 2. The Three States of a Promise
A Promise is always in one of three mutually exclusive states: [16] 

   1. Pending: The operation is still running (e.g., the browser is still loading the page).
   2. Fulfilled (Resolved): The operation completed successfully, and the data is ready.
   3. Rejected: The operation failed with an error (e.g., Playwright timed out waiting for a locator). [17, 18, 19, 20, 21] 

------------------------------
## 3. How to Handle Promises: async and await
While JavaScript handles Promises under the hood using .then() callbacks, modern TypeScript relies heavily on async and await syntax to make asynchronous code look and read like synchronous Java code. [22, 23, 24] 
## The Mental Mapping for Java Developers

* async keyword: Placed before a function declaration. It automatically forces that function to return a Promise wrapper, identical to returning a CompletableFuture or Future in Java. [25, 26, 27] 
* await keyword: Inline execution pause. It tells the runner to halt execution on this exact line until the Promise changes from Pending to Fulfilled, then unwraps the value. [28, 29, 30, 31] 

// Every step in Playwright returns a Promise because it communicates with a browserasync function loginFlow(page: any): Promise<void> {
    // 1. page.goto returns Promise<Response | null>
    await page.goto("https://example.com"); 

    // 2. locator.fill returns Promise<void>
    await page.locator("#username").fill("admin"); 
    
    // 3. locator.textContent returns Promise<string>
    const bannerText: string = await page.locator(".banner").textContent(); 
}

------------------------------
## What happens if you forget to await a Promise?
If you forget the await keyword, your variable will not hold the data you expect; instead, it will literal hold the unresolved Promise object itself. [32, 33, 34] 

const text = page.locator(".header").textContent(); // ❌ text is an unfulfilled Promise object, not the string!// ❌ text.toUpperCase() will crash because .toUpperCase() doesn't exist on a Promise.
const text = await page.locator(".header").textContent();//  text is now a normal string ("Dashboard") because await unwrapped it.

Would you like to see how to handle multiple Promises simultaneously using Promise.all() to optimize and speed up parallel actions in your automation framework?

# Promise.all()

Promise.all() is a built-in method used to run multiple asynchronous operations concurrently (in parallel). [1, 2] 
Instead of waiting for each Promise to finish one after the other, Promise.all() fires them off at the exact same time and waits for all of them to complete. This is highly effective for optimization in test automation. [3, 4, 5, 6, 7] 
------------------------------
## The Automation Problem: Sequential Waiting (Slow)
Imagine you need to click a submit button, and that click triggers two things: a page navigation and an API background request. If you write them sequentially, your test might trigger a race condition or take twice as long: [8, 9] 

// ❌ SLOW & PRONE TO FLAKINESSawait page.locator("#submit").click();await page.waitForURL("**/dashboard"); // Might miss the event if it happens too fast

## The Automation Solution: Promise.all() (Fast & Safe)
You pass an array of Promises to Promise.all(). It returns a single, unified Promise that resolves only when every single promise in the array has resolved. [10, 11, 12] 

//  FAST & SYNCHRONIZED// Playwright triggers the click and waits for the navigation concurrentlyawait Promise.all([
    page.waitForURL("**/dashboard"),  // Promise 1
    page.locator("#submit").click()   // Promise 2 (triggers the action)
]);

------------------------------
## Fetching Data in Parallel
You can also use Promise.all() to fetch data or state from multiple UI elements simultaneously. It preserves the exact order of the input array when returning the results. [13, 14] 

// Fire off three text extraction requests at the exact same timeconst [header, subheader, buttonText] = await Promise.all([
    page.locator("h1").textContent(),         // Resolves to string
    page.locator(".subtitle").textContent(),   // Resolves to string
    page.locator("#submit").textContent()      // Resolves to string
]);
// You now have access to all three normal string variables
console.log(header, subheader, buttonText);

## Critical Rules of Promise.all()

   1. The "All-or-Nothing" Fail-Fast Rule: If even one Promise in the array rejects (e.g., a locator times out), the entire Promise.all() block instantly fails and throws an error, even if the other operations succeeded.
   2. Order Preservation: The structured values returned in the array map perfectly to the index position they were declared in. [15, 16, 17, 18, 19] 

Would you like to explore how to handle errors within Promises using try/catch blocks, or should we look at how Playwright handles automatic retries so you rarely have to write explicit waiting logic?
