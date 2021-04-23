const SEM_BOT_BEGIN = '../../expe/clean/SEMBotBegin.json';
const SYN_BOT_BEGIN = '../../expe/clean/SYNBotBegin.json';
import fs from "fs";


(async() => {
    try {
        let results = [];

        //SEM_DEBUT
            for (let testFile of [SEM_BOT_BEGIN, SYN_BOT_BEGIN]) {
                const result = await analyze(testFile, false);
                results.push(result);
                console.log(result);
            }
    }
    catch(e) {
        console.error(e)
    }
})()

async function analyze(testFile : string, actionWithValue : boolean) {
    const testSuiteDescription = await readTestSuite(testFile);
    console.log(testFile, testSuiteDescription)

}

function readTestSuite(jsonPath : string) {
    const str = fs.readFileSync(jsonPath, "utf-8");
    const session = JSON.parse(str);
    const data = session.explorationList.map((exploration: any) => 
        exploration.interactionList.length
    );
    return {
        max: max(data),
        min: min(data),
        median: median(data),
        mean: mean(data)
    };
}


function max(array: number[]) {
    return Math.max.apply(null, array);
}

function min (array: number[]) {
    return Math.min.apply(null, array);
}

function range (array: number[]) {
    return max(array) - min(array);
}

function midrange (array: number[]) {
    return range(array) / 2;
}

function sum (array: number[]) {
    var num = 0;
    for (var i = 0, l = array.length; i < l; i++) num += array[i];
    return num;
}

function mean (array: number[]) {
    return sum(array) / array.length;
}

function median(array: number[]) {
    array.sort(function(a, b) {
        return a - b;
    });
    var mid = array.length / 2;
    return mid % 1 ? array[mid - 0.5] : (array[mid - 1] + array[mid]) / 2;
}