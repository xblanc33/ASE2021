import { Page } from "playwright";
import ProductHREFS from "./ProductHREFS";
import ProductPage from "./ProductPage";
import ShowBasketStateEnd from "./ShowBasketStateEnd";

export default class ProductStateEnd {
    private _page : Page;
    private _productPage : ProductPage;
    private _hasNavigated : boolean;
    
    constructor(page : Page) {
        this._page = page;
        this._productPage  = new ProductPage(page);
        this._hasNavigated = false;
    }

    async next() {
        if (!this._hasNavigated) {
            const index = Math.floor(Math.random()*ProductHREFS.length);
            const href = ProductHREFS[index];
            await this._productPage.navigate(href);
            this._hasNavigated = true;
            return this;
        }
        const proba = Math.random()*100;
        if (proba <= 10) {
            const index = Math.floor(Math.random()*ProductHREFS.length);
            const href = ProductHREFS[index];
            await this._productPage.navigate(href);
            return this;
        }
        if (proba <= 80) {
            await this._productPage.clickWarrantyAndInsurance();
            return this;
        } else {
            await this._productPage.addProductToBasket();
            return new ShowBasketStateEnd(this._page);
        }
    }
}