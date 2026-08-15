# Naming Convention
In Playwright with TypeScript, the standard naming convention balances clear structural hierarchies with strict TypeScript coding standards.

## File and Folder NamingDirectory names: 
Use lowercase, pluralized nouns for your main architecture blocks (e.g., pages/, tests/, fixtures/).Page Object files: Use camelCase or kebab-case with a .page.ts suffix to separate them visually from tests (e.g., login.page.ts or shoppingCart.page.ts).Test files: Use standard Playwright detection format (e.g., login.spec.ts).🏛️ Class NamingPascalCase: Class definitions must use PascalCase and end with the word Page to maintain strong object-oriented transparency.

Examples: LoginPage, ProductDetailsPage, CheckoutPage

``` typescript
// pages/login.page.ts
export class LoginPage {
  // Page implementation goes here
}
```

## Locator PropertiescamelCase with a descriptive suffix: 
Element properties should use camelCase combined with a semantic suffix reflecting the UI element type. This drastically improves auto-complete readability during test writing.

- Btn / Button: For interactive buttons (submitBtn, loginButton).
- Input / Txt: For input forms fields (usernameInput, emailTxt).
- Link: For hyperlinks (forgotPasswordLink).
- Dropdown / Select: For menu selections (countryDropdown).
- Header / Title / Label: For text assertions (welcomeHeader, errorLabel).

 ``` typescript
  readonly usernameInput: Locator;
  readonly loginBtn: Locator;
  readonly errorMessageLabel: Locator;
```

 ## Action MethodscamelCase verb prefixes: 
 Actions must be named using verbs that specify user intent.Avoid adding the word "page" into your methods (e.g., use login() instead of loginPage()).
 Examples: goto(), fillCredentials(), submitForm(), getErrorMessage().
 
 ``` typescript
 async fillCredentials(user: string, pass: string) {
  await this.usernameInput.fill(user);
  await this.passwordInput.fill(pass);
}
```

## Instantiated Objects & FixturescamelCase: 
When declaring instances inside your spec files or configuring custom fixtures, use lowercase camelCase.
Examples: loginPage, checkoutPage.

``` typescript
// In a test file
test('successful login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
});
```
