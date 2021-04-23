import { Page } from "playwright";
import BasketStateEnd from "./BasketStateEnd";
import ProductStateEnd from "./ProductStateEnd";
import ShowBasketPage from "./ShowBasketPage";

export default class ShowBasketStateEnd {
    private _page : Page;
    private _showBasketPage : ShowBasketPage;
    
    constructor(page : Page) {
        this._page = page;
        this._showBasketPage  = new ShowBasketPage(page);
    }

    async next() {
        const proba = Math.random()*100;
        if (proba <= 40) {
            return new ProductStateEnd(this._page);
        } else {
            await this._showBasketPage.showBasket();
            return new BasketStateEnd(this._page);
        }
    }
}