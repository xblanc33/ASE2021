//document.querySelector("#popinContainer > div.pClose.jsCancel")
import { Page } from "playwright";
import SearchBarComponent from "./SearchBarComponent";

export default class ProductPage {
    private _page : Page;
    private _searchBar : SearchBarComponent;

    constructor(page : Page) {
      this._page = page;
      this._searchBar = new SearchBarComponent(page);
    }

    async addProductToBasket() : Promise<void> {
        console.log('try addProductToBasket');
        await this._page.waitForSelector('#fpAddBsk');
        const productElementHandler = await this._page.$('#fpAddBsk');
        if (productElementHandler) {
            await productElementHandler.scrollIntoViewIfNeeded();
            await Promise.all([
                productElementHandler.click().then(() => {
                    return Promise.all([this.closeProposeMoreProductPopin(), this.closeProposeDiscountPopin(), this.closeNoProduct()])
                }),
                this._page.waitForNavigation({waitUntil:"load"}),
            ]);
        }
    }

    async navigate(href : string) : Promise<void> {
        console.log('try navitate:', href);
        await this._page.goto(href, {waitUntil: "domcontentloaded"});
        await this._page.waitForTimeout(2000);

        try {
            await this._page.waitForSelector('#footer_tc_privacy_button_2', {timeout:2000});
            await this._page.click('#footer_tc_privacy_button_2');
            console.log('footer is clicked');
        }catch(e) {
            console.log('no footer');
        }

        await this._page.waitForTimeout(2000);

        try {
            await this._page.waitForSelector('#privacy-cat-modal div.modal-header.flex-space-between  button.close', {timeout:2000});
            await this._page.click('#privacy-cat-modal div.modal-header.flex-space-between  button.close', {timeout:2000});
        } catch(e) {
            console.log('no close button');
        }

        await this._page.waitForTimeout(1000);
        console.log('navigate ok');
    }

    async clickWarrantyAndInsurance() : Promise<void> {
        console.log('try clickWarrantyAndInsurance');
        await this._page.waitForSelector('.fpGarserCheckboxView', {timeout:2000});
        const checkboxElementHandler = await this._page.$$('.fpGarserCheckboxView');
        if (checkboxElementHandler.length > 0) {
            console.log('should click');
            const index = Math.floor(Math.random()*checkboxElementHandler.length);
            await checkboxElementHandler[index].scrollIntoViewIfNeeded();
            await this._page.waitForTimeout(1000);
            await checkboxElementHandler[index].click();
            await this._page.waitForTimeout(1000);
        }
    }

    async search(text: string) {
        return await this._searchBar.search(text);
    }

    private async closeProposeMoreProductPopin() : Promise<void>{
        return new Promise((resolve, reject) => {
            return this._page.waitForSelector('#basketPushLp .btGreen', {timeout:4000})
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