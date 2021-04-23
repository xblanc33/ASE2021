// models/Search.js
import { Page } from "playwright";

export default class AIFEXPageOLD {
    private _page : Page;
    private _extensionKey : string | undefined;
    private _sessionURL : string | undefined;

    constructor(page : Page) {
      this._page = page;
    }

    async getPluginKey() {
        await this._page.goto(`chrome://extensions/`, {waitUntil: "domcontentloaded"});

        await this._page.waitForSelector('#devMode');
        const devModeHandler = await this._page.$('#devMode');
        if (devModeHandler) {
            const isChecked = await devModeHandler.getAttribute('aria-pressed');
            if (isChecked === "false") {
                await devModeHandler.click();
            }
            await this._page.waitForTimeout(2000);
        }

        await this._page.waitForSelector('#detailsButton');
        const extensionDetailHandler = await this._page.$('#detailsButton');
        if (extensionDetailHandler) {
            await extensionDetailHandler.click();
        }

        await this._page.waitForSelector('#id-section .section-content');
        const idHandler = await this._page.$('#id-section .section-content');
        this._extensionKey = await idHandler?.innerHTML();
        console.log(`extension key : ${this._extensionKey}`);
    }

    async connectToSession(url : string) {
        if (this._extensionKey) {
            await this._page.goto(`chrome-extension://${this._extensionKey}/popup/popup.html`, {waitUntil: "domcontentloaded"});
            await this._page.waitForSelector('#connectionCodeInput');
            const connexionInputHandler = await this._page.$('#connectionCodeInput');
            if (connexionInputHandler) {
                await connexionInputHandler.fill(url);
                const connexionSignInHandler = await this._page.$('#connectionSignIn');
                const createNewWindow = await this._page.$('#toggleShouldTestInNewWindow');
                if (connexionSignInHandler && createNewWindow) {
                    await createNewWindow.click();
                    await connexionSignInHandler.click();
                    await this._page.waitForTimeout(2000);
                    this._sessionURL = url;
                }
            }
        }
    }

    async start() {
        if (this._extensionKey && this._sessionURL) {
            await this._page.goto(`chrome-extension://${this._extensionKey}/popup/popup.html`, {waitUntil: "domcontentloaded"});
            await this._page.waitForSelector('#play-button', {timeout:2000});
            const playButtonHandler = await this._page.$('#play-button');
            if (playButtonHandler) {
                await this._page.waitForTimeout(1000);
                await playButtonHandler.click();
                await this._page.waitForTimeout(1000);
            }
        }
    }

    async stop() {
        if (this._extensionKey && this._sessionURL) {
            await this._page.goto(`chrome-extension://${this._extensionKey}/popup/popup.html`, {waitUntil: "domcontentloaded"});
            await this._page.waitForSelector('#stop-button', {timeout: 2000});
            const stopButtonHandler = await this._page.$('#stop-button');
            if (stopButtonHandler) {
                await stopButtonHandler.click();
                await this._page.waitForTimeout(1000);
            }
        }
    }

}