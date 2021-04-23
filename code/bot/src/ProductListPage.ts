import { Page } from "playwright";
import SearchBarComponent from "./SearchBarComponent";

export default class ProductListPage {
    private _page : Page;
    private _searchBar : SearchBarComponent;

    constructor(page : Page) {
      this._page = page;
      this._searchBar = new SearchBarComponent(page);
    }

    async selectProduct(index : number) {
        console.log('try selectProduct');
        await this._page.waitForSelector('.prdtBImg');
        const checkElementHandlerList = await this._page.$$('.prdtBImg');
        if (checkElementHandlerList.length > index) {
            await checkElementHandlerList[index].scrollIntoViewIfNeeded();
            await Promise.all([
                checkElementHandlerList[index].click(),
                //this._page.waitForNavigation({waitUntil:"load"})
                this._page.waitForTimeout(2000)
            ]);
        }
    }

    async addProductToBasket(index : number) : Promise<void> {
        console.log('try addProductToBasket');
        await this._page.waitForSelector('#lpBloc .btGreen');
        const productElementHandlerList = await this._page.$$('#lpBloc .btGreen');
        if (productElementHandlerList.length > index) {
            await productElementHandlerList[index].scrollIntoViewIfNeeded();
            await Promise.all([
                productElementHandlerList[index].click().then(() => {
                    return Promise.all([this.closeProposeMoreProductPopin(), this.closeProposeDiscountPopin(), this.closeNoProduct()])
                }),
                //this._page.waitForNavigation({waitUntil:"load"}),
                this._page.waitForTimeout(2000)
            ]);
        }
    }

    async filterProducts(index : number) {
        console.log('try filterProducts');
        await this._page.waitForSelector('#facetsList li');
        const list = await this._page.$$('#facetsList li');
        if (list.length > index) {
            await list[index].scrollIntoViewIfNeeded();
            await list[index].click();
            await this._page.waitForTimeout(2000);
        }
    }

    async nextPage() {
        console.log('try nextPage');
        await this._page.waitForSelector('div.pgLight div.pgLightPrevNext  a');
        const nextPageHandler = await this._page.$('div.pgLight div.pgLightPrevNext  a');
        if (nextPageHandler) {
            await nextPageHandler.scrollIntoViewIfNeeded();
            await Promise.all([
                nextPageHandler.click(),
                this._page.waitForTimeout(2000)
                //this._page.waitForNavigation({waitUntil:"load"})
            ]);
        }
    }

    async search(text: string) {
        return await this._searchBar.search(text);
    }

    private async closeProposeMoreProductPopin() : Promise<void>{
        return new Promise((resolve, reject) => {
            return this._page.waitForSelector('#basketPushLp .btGreen', {timeout:2000})
                .then(() => {
                    return this._page.$('#basketPushLp .btGreen')
                })
                .then((value) => {
                    if (value) {
                        value.click()
                        .then(() => {
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                })
                .catch ( ()=> {
                    resolve();
                });
        });
    }

    private async closeProposeDiscountPopin() : Promise<void> {
        return new Promise((resolve, reject) => {
            return this._page.waitForSelector('#popinContainer input', {timeout:2000})
                .then(() => {
                    return this._page.$('#popinContainer input')
                })
                .then((value) => {
                    if (value) {
                        value.click()
                        .then(() => {
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                })
                .catch ( ()=> {
                    resolve();
                });
        });

    }

    private async closeNoProduct() : Promise<void> {
        return new Promise((resolve, reject) => {
            return this._page.waitForSelector('#overlay input', {timeout:2000})
                .then(() => {
                    return this._page.$('#overlay input')
                })
                .then((value) => {
                    if (value) {
                        value.click()
                        .then(() => {
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                })
                .catch ( ()=> {
                    resolve();
                });
        });

    }
}