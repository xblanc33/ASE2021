import { Page } from "playwright";
import HomePage from "./HomePage";
import ProductListPageState from "./ProductListState";
import SearchQueries from "./SearchQueries";

export default class HomeState {
    private _page : Page;
    private _homePage : HomePage;
    private _hasNavigated : boolean;
    
    constructor(page : Page) {
        this._page = page;
        this._homePage  = new HomePage(page);
        this._hasNavigated = false;
    }

    async next() {
        if (!this._hasNavigated) {
            await this._homePage.navigate();
            this._hasNavigated = true;
            return this;
        } else {
            const index = Math.floor(Math.random()*SearchQueries.length);
            await this._homePage.search(SearchQueries[index]);
            return new ProductListPageState(this._page);
        }
    }
}