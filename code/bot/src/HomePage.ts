// models/Search.js
import { Page } from "playwright";
import SearchBarComponent from "./SearchBarComponent";

export default class HomePage {
    private _page : Page;
    private _searchBar : SearchBarComponent;

    constructor(page : Page) {
      this._page = page;
      this._searchBar = new SearchBarComponent(page);
    }

    async navigate() {
        await this._page.goto('https://www.cdiscount.com', {waitUntil: "domcontentloaded"});
        await this._page.waitForTimeout(1000);
        
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
        console.log('navigate ok');
    }

    async search(text: string) {
        await this._page.waitForTimeout(1000);
        return await this._searchBar.search(text);
    }
}