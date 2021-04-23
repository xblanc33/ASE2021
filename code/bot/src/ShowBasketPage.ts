// models/Search.js
import { Page } from "playwright";
import SearchBarComponent from "./SearchBarComponent";

export default class ShowBasketPage {
    private _page : Page;
    private _searchBar : SearchBarComponent;

    constructor(page : Page) {
      this._page = page;
      this._searchBar = new SearchBarComponent(page);
    }

    async showBasket() : Promise<void> {
        await this._page.waitForSelector('#raContent > div.raFixedRightCol.jsRaFixedRightCol > div.raColTop > a.btGreen.btF');
        const showBasketElementHandler = await this._page.$('#raContent > div.raFixedRightCol.jsRaFixedRightCol > div.raColTop > a.btGreen.btF');
        if (showBasketElementHandler) {
            await showBasketElementHandler.scrollIntoViewIfNeeded();
            await Promise.all([
                showBasketElementHandler.click(),
                this._page.waitForNavigation({waitUntil:"load"}),
            ]);
        }
    }

    async search(text: string) {
        return await this._searchBar.search(text);
    }

}