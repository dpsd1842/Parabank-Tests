# > Type

The "type" field in a package.json file explicitly instructs Node.js how to interpret and execute standard .js files within your project.

## 1. type: "commonjs" (The Legacy Default)
CommonJS (CJS):
 - It is the original module system built directly into Node.js. If you do not specify a "type" field in your package.json, Node.js defaults to this layout automatically.Syntax: Uses require() to pull files in and module.exports to share items out.Behavior: It loads modules synchronously (one at a time, blocking execution). This was designed specifically for server-side development where files are read instantly from a local hard drive.

Example:
``` javascript
// Importing
const playwright = require('@playwright/test');
// Exporting
module.exports = { MyClass };
```

## 2. type: "module" (The Modern Standard)
ECMAScript Modules (ESM): 
- It is the official, globally standardized module system for JavaScript. It is natively used by modern web browsers and all recent versions of Node.js.Syntax: Uses the native import and export language keywords.Behavior: It loads modules asynchronously and performs static evaluation. This allows tools to use tree-shaking (automatically stripping away unused dead code during compilation to keep packages lightweight).

Example:
``` javascript
// Importing
import { test } from '@playwright/test';
// Exporting
export class MyClass {}
```

## 🔄 Comparing the Two Core Types
| Feature | type: "commonjs" | 📦type: "module" |
|:-------------------------|------------------------|------------------|
| 🚀Import Syntax | const x = require('x') | import x from 'x' |
| Export Syntax | module.exports = x | export default x |
| Loading | Synchronous (blocking) | Asynchronous (non-blocking) |
| Top-Level Await❌ | Not supported | Supported natively |
| Tree-Shaking❌ | Hard for compilers to optimize | Excellent dead-code removal |


## 🔀 File Suffix Overrides: .cjs vs .mjs

Sometimes you need a quick mix of both systems within the same project. 
To avoid creating multiple package.json files, Node.js provides explicit file extensions that completely bypass the "type" field rule:
- .cjs (Always CommonJS): No matter what your package.json says, files ending in .cjs are always treated as legacy CommonJS files.
- .mjs (Always ES Module): Files ending in .mjs are strictly interpreted as ES Modules. This is how frameworks like Next.js run configuration files smoothly without forcing you to switch your entire repository over to ESM.

## 🧪 Legacy Historical Variations (Bundler & Browser Only)
Before Node.js added official support for native ES Modules, older browser bundlers relied on non-standard configurations. 
While not valid options for the package.json "type" field, you might spot these terms mentioned in older documentation:

### AMD (Asynchronous Module Definition): 
Historically used in frontend web browsers via wrappers like RequireJS to load scripts asynchronously without freezing the UI page.

### UMD (Universal Module Definition): 
A complex boilerplate pattern that detected the running environment at launch. It dynamically checked whether to behave like CommonJS or AMD depending on where the script was running.

<hr/>
<hr/>

# > module, target, moduleResoultion

To understand how TypeScript handles your code, think of it as a bridge with two sides. One side handles how your code looks when written (syntax like async/await), while the other side handles how files connect to one another (how import finds a file).

These three settings manage that behavior:

## 🎯 1. target
The target setting controls the JavaScript syntax features the TypeScript compiler outputs after removing your types. 
It tells TypeScript: "How modern or old should the compiled JavaScript look?"
What it does: If you use a modern feature like the nullish coalescing operator (??) or an async/await loop, target decides whether to leave it as-is or rewrite it into complex, old-fashioned code so older environments can understand it.

### Common Values & Meanings:
- "ESNext": Emits the absolute latest JavaScript syntax. No modern features are down-compiled.
- "ES2022" / "ES2020": Emits syntax standard to those specific years. For instance, ES2022 leaves class fields and top-level await untouched because modern Node.js versions natively support them.
- "ES5": Converts everything back into old pre-2015 prototype JavaScript. async/await blocks get rewritten into massive, messy state-machine wrappers.

### Playwright Best Practice: 
Use "ES2022" or "ESNext". Playwright requires modern Node.js versions that already natively understand recent JavaScript features.

## 📦 2. module
The module setting controls how files export and import things in the compiled JavaScript output. 
It tells TypeScript: "What module mechanism should the final output use?"
What it does: It changes how your import and export statements are written in the final build.

### Common Values & Meanings:
- "CommonJS": Translates your clean import { test } from '...' syntax into legacy Node.js const test = require('...') statements.
- "ESNext" / "ES2022": Leaves your import and export statements exactly as they are, relying on the native JavaScript module system.

### Playwright Best Practice: 
Match this with your package.json setup. If you set "type": "module", use "ESNext".

## 🔍 3. moduleResolution
The moduleResolution setting controls the algorithm TypeScript uses to look up files when you write an import path. 

It tells TypeScript: "How do I track down where a file actually lives when you say import x from 'y'?
"What it does: It mimics the module discovery behavior of various hosting environments. It determines if TypeScript looks for package.json "exports", if it appends .js extensions automatically, or if it searches deeply within nested folders.

### Common Values & Meanings:
- "bundler" (Recommended): Mimics the ultra-modern lookup strategies used by tools like Vite, Esbuild, and recent versions of Node.js. It supports package.json "imports" / "exports" path mapping and lets you import files without manually typing out .ts or .js file extensions.
- "nodeNext" / "node16": Strictly mimics modern Node.js exactly. It forces you to write explicit file extensions on your relative imports (e.g., you must write import { x } from './file.js' even though the file is named file.ts).
- "node10" / "node" (Deprecated): The ancient strategy that only looks for node_modules folders or basic file/index matches. It doesn't recognize modern package.json routing configurations.

### Playwright Best Practice: 
Use "bundler". It gives you the cleanest imports while fully satisfying modern TypeScript compiler expectations.

### 🗺️ Summary Cheat Sheet
| Setting | Direct Translation | Focuses On |
| ------- | ------------------ | ---------- |
| target  | "How new should the syntax look? | "Code syntax features (const, async, ??) |
| module  | "How should files stitch together?" | Import/Export syntax translation (require vs import) |
| moduleResolution | "How do I find a file on disk?" | Path tracking rules and dependency matching |


| Property | Decision It Represents | Why it can't be guessed | 
| -------- | ---------------------- | ----------------------- |
| target | Engine Power ➔ What syntax features does my platform support natively? | An old runtime might still need modern file structures. |
| module | Wrapper Style ➔ Do my files stitch together via require or import? | The same wrapper style can be processed by different tools.| 
| moduleResolution | Lookup Rules ➔ How does the compiler physically track down file paths? | Tooling choices (like Vite vs native Node) alter path lookups. |

<hr>
<hr>

# > type [package.json] vs types [tsconfig.json]

They are completely different settings that control entirely unrelated parts of your project.
- "type" in package.json is a runtime setting for Node.js. It dictates how JavaScript files are executed (CommonJS vs. ES Modules).
- "types" in tsconfig.json is a compile-time setting for TypeScript. It tells the compiler which global type definitions to load into your project.

## 🗺️ Direct Comparison
| Feature | "type" in package.json | 📦"types" in tsconfig.json |
| ------- | ---------------------- | --------------------------- |
 |🛠️Who reads it? | Node.js (at runtime) [1, 2] | TypeScript Compiler (during code editing/building) | 
 | What it affects | Behavior of actual compiled JS code. | Autocomplete, Intellisense, and type checking in VS Code. |
 | What it controls | Whether files use require() or import. | Which global declarations (like process.env or test()) are visible.|
 | Example values | "module" or "commonjs" [1] | ["node", "playwright"] |

## 🔍 Understanding "types": ["node", "playwright"]
By default, TypeScript automatically loads type definitions for every package it finds inside your node_modules/@types folder.When you explicitly add the "types" array to your tsconfig.json, you are turning off that automatic behavior and telling TypeScript: "Only load global types for the specific packages listed here."

Here is exactly what your specific array signifies:
- "node": Instructs TypeScript to load the type definitions from @types/node. This enables autocomplete for global Node.js variables like process, __dirname, Buffer, and setTimeout.
- "playwright": Instructs TypeScript to load global helpers specific to the Playwright environment, making sure your editor natively recognizes assertions, locators, and testing constructs.

## ⚠️ A Playwright Best Practice Note
In modern Playwright setups, you often do not need to explicitly list "playwright" inside the "types" array.
Because you explicitly import Playwright features directly into your test files (e.g., import { test, expect } from '@playwright/test'), TypeScript automatically pulls in those types on the fly.


# > Mapping between type [package.json] and module [tsconfig.json]
Here is the full configuration mapping for both module systems.To prevent runtime crashes like SyntaxError, your compiler, file resolution rules, and Node.js runtime must perfectly align. Choose the configuration block below that matches your project goals.

## 🚀 Option A: Modern ESM Setup (Recommended)
Use this setup if you want a future-proof framework that natively utilizes standard import/export keywords and supports Node.js Subpath Imports (#pages/login.page).package.json
```json
{
  "name": "parabank-tests",
  "version": "1.0.0",
  "type": "module",
  "imports": {
    "#pages/*": "./pages/*",
    "#fixtures/*": "./fixtures/*"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "typescript": "^5.0.0" 
  }
}
```

tsconfig.json
```json
{
  "$schema": "https://schemastore.org",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "tests/**/*.ts",
    "pages/**/*.ts",
    "fixtures/**/*.ts",
    "playwright.config.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

## 📦 Option B: Legacy CommonJS Setup
Use this setup if your tests are inside a legacy monorepo or require compatibility with older internal npm packages that rely strictly on require().
package.json
```json
{
  "name": "parabank-tests",
  "version": "1.0.0",
  "type": "commonjs",
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "typescript": "^5.0.0"
  }
}
```

tsconfig.json
```json
{
  "$schema": "https://schemastore.org",
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node10", 
    "ignoreDeprecations": "6.0",    
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["pages/*"],
      "@fixtures/*": ["fixtures/*"]
    }
  },
  "include": [
    "tests/**/*.ts",
    "pages/**/*.ts",
    "fixtures/**/*.ts",
    "playwright.config.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

## 🔍 Direct Comparison Cheat Sheet
| Config Property | Modern ESM (Option A) | 🚀Legacy CommonJS (Option B) | 
| --------------- | --------------------- | ----------------------------- |
| 📦package.json -> "type" | "module" | "commonjs" | 
| tsconfig.json -> "module" | "ESNext" | "CommonJS" |
 | tsconfig.json -> "moduleResolution" | "bundler" | "node10" (requires ignoreDeprecations) | 
 | Path Import Aliases Setup | "imports" field in package.json | "paths" field in tsconfig.json | 
 | How clean imports look | import { x } from '#pages/x'; | import { x } from '@pages/x'; | 

<hr>
<hr>

# > tsconfing file

If you delete or do not define a tsconfig.json file, your project behavior will split into two different experiences depending on whether you are running tests or writing code.

### 1. Will it cause an execution error in Playwright?
No, your tests will still run fine.Playwright has a built-in "zero-config" architecture. When you run npx playwright test, Playwright internally handles the compilation of your TypeScript files on the fly. If it cannot find a local tsconfig.json, it relies on its internal fallback configurations. Your test scripts will compile and execute without throwing an automated environment crash.

### 2. What are the TypeScript fallback defaults?
If you run the standard TypeScript compiler (tsc) on a project without a configuration file, it falls back to the absolute bare-minimum values:
- target ➔ ES3 or ES5: It defaults to incredibly old JavaScript syntax.
- module ➔ CommonJS: It assumes traditional Node.js file wrapping patterns.
- strict ➔ false: Crucial type safety settings are completely disabled. This allows implicit any variables to slip through without triggering warning flags.
- moduleResolution ➔ Classic or Node10: It completely avoids searching modern package structures or evaluating package.json "imports" routing blocks.

### ⚠️ What WILL break if you delete tsconfig.json?
While Playwright can handle executing the tests blindly, omitting the file introduces severe problems into your development environment:
#### ❌ IDE Intellisense & Type Checking Break Completely
Your text editor (like VS Code) depends entirely on tsconfig.json to understand your project layout. Without it, you will notice:
- All of your text files will likely fill up with red underline errors.
- Node.js global variables like process.env or setTimeout will flag an error stating they cannot be found.
- Auto-import and method autocompletion features for your Page Objects will stop functioning completely.

#### ❌ Absolute Paths and Clean Imports Fail
If you want to use modern subpath imports (like import { LoginPage } from '#pages/login'), your code editor will throw a path resolution error. It cannot resolve what #pages/ means without a configuration context tying it back to your project directory roots.

### 💡 The Verdict
Never delete your tsconfig.json file. Even though Playwright can technically bypass it during execution, your coding experience inside your editor will be crippled by missing types, broken auto-completes, and false-positive syntax errors.