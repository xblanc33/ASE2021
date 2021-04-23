import { Page } from "playwright";
import ProductListState from "./ProductListState";
import ProductPage from "./ProductPage";
import SearchQueries from "./SearchQueries";
import ShowBasketState from "./ShowBasketState";

export default class ProductStateEnd {
    private _page : Page;
    private _productPage : ProductPage;
    
    constructor(page : Page) {
        this._page = page;
        this._productPage  = new ProductPage(page);
    }

    async next() {
        const proba = Math.random()*100;
        //if (proba <= 60) {
            const index = Math.floor(Math.random()*SearchQueries.length);
            await this._productPage.search(SearchQueries[index]);
            return new ProductListState(this._page);
        /*} else {
            await this._productPage.addProductToBasket();
            return new ShowBasketState(this._page);
        }*/
    }
}