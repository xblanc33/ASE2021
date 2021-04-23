import { Page } from "playwright";


export default class FinalState {
    private _page : Page;
    
    constructor(page : Page) {
        this._page = page;
    }

    async next() {
        return this;
    }
}