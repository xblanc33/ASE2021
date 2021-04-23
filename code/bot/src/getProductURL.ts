//document.querySelectorAll("#lpBloc  div.prdtBILDetails  a")

import fs from 'fs';
import fetch from 'node-fetch';
import {BrowserContext, chromium, Page} from 'playwright';
import AIFEXPage from "./AIFEXPage";
//import AIFEXPage from "./AIFEXPageOLD";
import HomeState from "./HomeState";
import State from "./State";
import config from "./config";
import HomePage from './HomePage';
import SearchQueries from "./SearchQueries";

(async () => {
    try {
        console.log('Start crawling');
        let browser : BrowserContext = await chromium.launchPersistentContext(config.USER_DATA_DIR, { 
            headless: config.HEADLESS, 
            slowMo: config.SLOWMO,
        });
        let page = await browser.newPage();
        let homePage = new HomePage(page);
        await homePage.navigate();
        let hrefs : string[] = [];
        for (let i = 0 ; i < SearchQueries.length ; i++) {
            const query = SearchQueries[i];
            console.log('query:',query);
            await homePage.search(query);
            const hrefsForQuery = await page.evaluate(() => {
                const hrefsInBrowser : string[] = [];
                document.querySelectorAll("#lpBloc  div.prdtBILDetails  a").forEach((element) => {
                    const href = element.getAttribute('href');
                    if (href) {
                        hrefsInBrowser.push(href.split('?')[0]);
                    }
                })
                return hrefsInBrowser;
            })
            hrefs.push(...hrefsForQuery);
            console.log('number of hrefs = ', hrefs.length);
        }
        console.log('no more query');
        await page.close();
        await browser.close();
        console.log('will save');
        fs.writeFileSync('./tmp/hrefs.txt',hrefs.join('\n'));
        console.log('saved');
    } catch(e) {
        console.log(e);
    }
})();