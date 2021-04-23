import fs from 'fs';
const CONFIG_RAW = fs.readFileSync(process.cwd()+'/config.json', 'utf-8');
const CONFIG_JSON = JSON.parse(CONFIG_RAW);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const START_BOT_AUTO_GEN = CONFIG_JSON.START_BOT_AUTO_GEN;
const END_BOT_AUTO_GEN = CONFIG_JSON.END_BOT_AUTO_GEN;
const START_BOT_CATCH_ALL = CONFIG_JSON.START_BOT_CATCH_ALL;
const END_BOT_CATCH_ALL = CONFIG_JSON.END_BOT_CATCH_ALL;

const TESTER_NAME = CONFIG_JSON.TESTER_NAME;

const NUMBER_OF_TESTS = CONFIG_JSON.NUMBER_OF_TESTS;

const SERVER_URL = CONFIG_JSON.SERVER_URL;

const HEADLESS = false;
const SLOWMO = 50;
const USER_DATA_DIR = process.cwd()+'/tmp/user';
const EXTENION_PATH = process.cwd()+'/tmp/chrome';

const config = {
    START_BOT_AUTO_GEN,
    END_BOT_AUTO_GEN,
    START_BOT_CATCH_ALL,
    END_BOT_CATCH_ALL,
    TESTER_NAME,
    NUMBER_OF_TESTS,
    SERVER_URL,
    HEADLESS,
    SLOWMO,
    USER_DATA_DIR,
    EXTENION_PATH
}

export default config;
