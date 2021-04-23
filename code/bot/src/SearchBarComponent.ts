import { Page } from "playwright";

export default class SearchBarComponent {
    private _page : Page;

    constructor(page : Page) {
      this._page = page;
    }

    async search(text: string) {
        console.log('try search');
        const searchElementHandler = await this._page.$('div.hSearch div.hSrcInput input[type=search]');
        const searchButton = await this._page.$('div.hSearch div.hSrcInput button');
        if (searchElementHandler && searchButton) {
            await searchElementHandler.hover();
            await searchElementHandler.click();
            await searchElementHandler.fill('');
            await searchElementHandler.type(text);
            await searchElementHandler.press('Tab'),
            await Promise.all([
                
                searchButton.click(),
                //this._page.waitForNavigation({waitUntil:"load"})
                this._page.waitForTimeout(2000)
            ])
        }
    }
}