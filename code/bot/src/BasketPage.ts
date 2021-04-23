// models/Search.js
import { Page } from "playwright";
import SearchBarComponent from "./SearchBarComponent";

export default class BasketPage {
    private _page : Page;
    private _searchBar : SearchBarComponent;

    constructor(page : Page) {
      this._page = page;
      this._searchBar = new SearchBarComponent(page);
    }

    async deliver() : Promise<void> {
        await this._page.waitForSelector('#bBlocPrix > div > a');
        const deliverBasketElementHandler = await this._page.$('#bBlocPrix > div > a');
        if (deliverBasketElementHandler) {
            await deliverBasketElementHandler.scrollIntoViewIfNeeded();
            await Promise.all([
                deliverBasketElementHandler.click(),
                this._page.waitForNavigation({waitUntil:"load"}),
            ]);
        }
    }

    async search(text: string) {
        return await this._searchBar.search(text);
    }

}