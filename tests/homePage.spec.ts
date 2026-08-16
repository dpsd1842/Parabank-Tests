import { test, expect } from '../src/fixtures/base.fixture.js';
test.describe('Verify Login and Home Page', async () => {
    test('HomePageTest', async ({ welcomePage, homePage }) => {
        test.step('After Login: Validating Log Out Link', async () => {
            await homePage.verifyLogOutLink();
        });
    });
});
