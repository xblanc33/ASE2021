import { Page } from "playwright";
import BasketPage from "./BasketPage";
import FinalState from "./FinalState";
import ProductStateEnd from "./ProductStateEnd";

export default class BasketStateEnd {
    private _page : Page;
    private _basketPage : BasketPage;
    
    constructor(page : Page) {
        this._page = page;
        this._basketPage  = new BasketPage(page);
    }

    async next() {
        const proba = Math.random()*100;
        if (proba <= 60) {
            return new ProductStateEnd(this._page);
        } else {
            await this._basketPage.deliver();
            return new FinalState(this._page);
        }
    }
}