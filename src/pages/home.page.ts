import { Locator, Page } from "@playwright/test";
import { expect } from "../fixtures/base.fixture.js";

export class HomePage {

    readonly page: Page;
    readonly logoutLink: Locator;

    constructor(page:Page) {
        this.page = page;
        this.logoutLink = page.locator('a[href*="logout"]');
    }

    async verifyLogOutLink() {
        await expect(this.logoutLink).toBeVisible();
        expect(await this.logoutLink.innerText() === 'Log Out').toBeTruthy();
    }
}