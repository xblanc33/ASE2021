import { Page } from "playwright";
import BasketPage from "./BasketPage";
import BasketState from "./BasketState";
import ProductListState from "./ProductListState";
import ProductPage from "./ProductPage";
import SearchQueries from "./SearchQueries";
import ShowBasketPage from "./ShowBasketPage";

export default class ShowBasketState {
    private _page : Page;
    private _showBasketPage : ShowBasketPage;
    
    constructor(page : Page) {
        this._page = page;
        this._showBasketPage  = new ShowBasketPage(page);
    }

    async next() {
        const proba = Math.random()*100;
        if (proba <= 60) {
            const index = Math.floor(Math.random()*SearchQueries.length);
            await this._showBasketPage.search(SearchQueries[index]);
            return new ProductListState(this._page);
        } else {
            await this._showBasketPage.showBasket();
            return new BasketState(this._page);
        }
    }
}