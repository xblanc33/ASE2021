import { Page } from "playwright";
import ProductListPage from "./ProductListPage";
import ProductPageState from "./ProductState";
import SearchQueries from "./SearchQueries";
import ShowBasketState from "./ShowBasketState";

export default class ProductListState {
    private _productListPage : ProductListPage;
    private _page : Page;
    
    constructor(page : Page) {
        this._productListPage  = new ProductListPage(page);
        this._page = page;
    }

    async next() {
        const proba = Math.random()*100;
        if (proba <= 40) {
            const index = Math.floor(Math.random()*SearchQueries.length);
            await this._productListPage.search(SearchQueries[index]);
            return this;
        } else if (proba <= 60)  {
            const index = Math.floor(Math.random()*10);
            await this._productListPage.filterProducts(index);
            return this;
        } else if (proba <= 90) {
            const index = Math.floor(Math.random()*10);
            await this._productListPage.selectProduct(index);
            return new ProductPageState(this._page);
        } else {
            /*const index = Math.floor(Math.random()*10);
            await this._productListPage.addProductToBasket(index);
            return new ShowBasketState(this._page);*/
            await this._productListPage.nextPage();
            return this;
        }
    }
}