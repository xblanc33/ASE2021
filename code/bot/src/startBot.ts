import { promises as fsPromises } from 'fs';
import fs from 'fs';
import fetch from 'node-fetch';
import {chromium, Page} from 'playwright';
import AIFEXPage from "./AIFEXPage";
import HomeState from "./HomeState";
import State from "./State";
import config from "./config";
import rimraf from "rimraf";
import UserAgent from 'user-agents';

let unzipper = require('unzipper');
const userAgent = new UserAgent().toString()
console.log(userAgent);

(async () => {
  //await run(config.START_BOT_AUTO_GEN);
  await run(config.START_BOT_CATCH_ALL);
})();

async function run(session: string) {
  let browser:any;
  let page;
  let aifexPage;
  for (let i = 0 ; i < config.NUMBER_OF_TESTS ; i++) {
    console.log('run ',i);
    try {
      //if ((i % 10) === 0) {
        if (browser) {
          await browser.close();
        }
        console.log('Chromium reset');
        rimraf.sync('./tmp/*');
        await installAIFEXExtension();
        browser = await chromium.launchPersistentContext(config.USER_DATA_DIR, { 
          userAgent,
          headless: config.HEADLESS, 
          slowMo: config.SLOWMO,
          args: [
            `--disable-extensions-except=${config.EXTENION_PATH}`,
            `--load-extension=${config.EXTENION_PATH}`
          ]
        });
        page = await browser.newPage();
        aifexPage = new AIFEXPage(page);
        await aifexPage.getPluginKey();
        await aifexPage.connectToSession(session);
      //}

      if (aifexPage && page) {
        await aifexPage.start();
        await performRandomExploration(page);
        await aifexPage.stop();
      }
    } catch (e) {
      console.log(e);
    }
  } 
  if (browser) {
    browser.close();
  }
};

function installAIFEXExtension() {
  const path = process.cwd()+'/tmp';
  const URL = config.SERVER_URL+'/static/chromeExtension.zip';
  return fetch(URL)
  .then( (res) => {
    if (res && res.ok) {
      return res.arrayBuffer();
    } else {
      return Promise.reject('no such file');
    }
  })
  .then ((buffer) => {
    return fsPromises.unlink(path+'/extension.zip')
    .then(() => {
      return fsPromises.appendFile(path+'/extension.zip', Buffer.from(buffer));
    })
    .catch( () => {
      return fsPromises.appendFile(path+'/extension.zip', Buffer.from(buffer));
    })
  })
  .then (() => {
    return new Promise((resolve, reject) => {
      let stream = fs.createReadStream(path+'/extension.zip').pipe(unzipper.Extract({ path: './tmp' }));
      stream.on('finish', () => {
        console.log('extension is downloaded and unzipped')
        resolve('ok');
      });
      stream.on('error', () => {
        console.log('error unzip extension');
        reject();
      });
    })
  })
}

async function performRandomExploration(page : Page) {
  let state : State = new HomeState(page);
  const randomLength = 5 + Math.floor(Math.random()*15);
  for (let i = 0 ; i <= randomLength ; i++) {
    try {
      state = await state.next();
      console.log('action is done');
    } catch (e) {
      console.log('action aborted (will try another one)');
    }
  }
}