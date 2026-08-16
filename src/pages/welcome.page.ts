import { Expect, Page, Locator } from "@playwright/test";
import { getTestData } from '../utils/utils.js';

export class WelcomePage {

    readonly page: Page;
    readonly userNameField: Locator;
    readonly pwdField: Locator;
    readonly loginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.userNameField = page.locator('input[name="username"]');
        this.pwdField = page.locator('input[name="password"]');
        this.loginButton = page.locator('input[type="submit"]');
    }
    
    async login(userName: string, pwd: string) {
        const testData = await getTestData();
        console.log('Base URL - ' + testData.baseURL);
        await this.page.goto(testData.baseURL);
        await this.userNameField.fill(userName);
        await this.pwdField.fill(pwd);
        await this.loginButton.click();
    }
}