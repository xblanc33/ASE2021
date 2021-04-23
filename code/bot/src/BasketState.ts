import { Page } from "playwright";
import BasketPage from "./BasketPage";
import FinalState from "./FinalState";
import ProductListState from "./ProductListState";
import SearchQueries from "./SearchQueries";

export default class BasketState {
    private _page : Page;
    private _basketPage : BasketPage;
    
    constructor(page : Page) {
        this._page = page;
        this._basketPage  = new BasketPage(page);
    }

    async next() {
        const proba = Math.random()*100;
        if (proba <= 60) {
            const index = Math.floor(Math.random()*SearchQueries.length);
            await this._basketPage.search(SearchQueries[index]);
            return new ProductListState(this._page);
        } else {
            await this._basketPage.deliver();
            return new FinalState(this._page);
        }
    }
}