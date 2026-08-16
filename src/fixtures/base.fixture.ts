import { test as baseTest, expect } from "@playwright/test";
import { WelcomePage } from "../pages/welcome.page.js";
import { HomePage } from "../pages/home.page.js";
import { getTestData, getTestDataNode } from '../utils/utils.js';

type MyFixtures = {
    welcomePage: WelcomePage;
    homePage: HomePage
}

export const test = baseTest.extend<MyFixtures> ({
    welcomePage: async ({ page }, use) => {
        const welcomePage = new WelcomePage(page);
        const userName = await getTestDataNode('admin_data', 'username');
        const password = await getTestDataNode('admin_data', 'password');
        console.log('Signing in with ' + userName + '; ' + password);
        await welcomePage.login(userName, password);
        await use(welcomePage);
    },
    homePage: async ({ page }, use) => {
        const homePage = new HomePage(page);
        await use(homePage);
    }
});

export { expect }