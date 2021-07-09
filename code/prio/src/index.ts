import { createTestSuiteFromJSONFile, createUsageProfileFromJSONFile, readTestSuiteDescriptionFromCSV } from "./Factory";
import UsageCoverageMatrix from "./UsageCoverageMatrix";
import UsagePattern from "./UsagePattern";
import * as winston from "winston";
import { exportExperimentationResultsToCSV, exportTestSuiteToCSV, exportUsageCoverageMatrixToCSV } from "./Export";
import TestSuite from "./TestSuite";


const TEST_SUITE_FILE = '../../expe/clean/testSuiteClean.csv';

//AUTO_GEN
const SEM_TEST = '../../expe/clean/SEMTest.json';
const SEM_BOT_BEGIN = '../../expe/clean/SEMBotBegin.json';
const SEM_BOT_END = '../../expe/clean/SEMBotEnd.json';


//CATH_ALL
const SYN_TEST = '../../expe/clean/SYNTest.json';
const SYN_BOT_BEGIN = '../../expe/clean/SYNBotBegin.json';
const SYN_BOT_END = '../../expe/clean/SYNBotEnd.json';


const OPTIMIZE = true;


(async() => {
    try {
        let results = [];

        //SEM_DEBUT
        let [profile,test] = [SEM_BOT_BEGIN,SEM_TEST];
        for (let k of ["ID","CSP","SP","IS"]) {
            let aKind = k as "ID" | "CSP" | "SP" | "IS";
            for (let i = 1 ; i <= 8 ; i++) {
                const result = await runExperimentation(test, profile, i, aKind, false, "Debut", OPTIMIZE);
                results.push(result);
                console.log(result);
            }
        }
        

        //SYN_DEBUT
        [profile,test] = [SYN_BOT_BEGIN, SYN_TEST];
        for (let k of ["ID","CSP","SP","IS"]) {
            let aKind = k as "ID" | "CSP" | "SP" | "IS";
            for (let i = 1 ; i <= 8 ; i++) {
                const result = await runExperimentation(test, profile, i, aKind, true, "Debut", OPTIMIZE);
                results.push(result);
                console.log(result);
            }
        }

        //SYN_DEBUT
        //FOR COUNTING SP PATTERNS
        /*[profile,test] = [SYN_BOT_BEGIN, SYN_TEST];
        let result = await runExperimentation(test, profile, 8, "CSP", true, "Debut", false);
        console.log(result);
        result = await runExperimentation(test, profile, 6, "IS", true, "Debut", false);
        console.log(result);

        const date = new Date();
        const dateString = `${date.getMonth()+1}_${date.getUTCDate()}_${date.getHours()}_${date.getMinutes()}`;
        exportExperimentationResultsToCSV(results, './tmp/allResults_'+dateString+'.csv');*/

        /*const result1 = await runExperimentation(SEM_TEST, SEM_BOT_BEGIN, 4, "CSP", false);
        console.log(result1);
        SEM_BOT_END result2 = await runExperimentation(SEMBotEnd, SEM_BOT_BEGIN, 4, "CSP", true);
        console.log(result2);
        SEM_BOT_END result3 = await runExperimentation(SEMBotEnd, DEBUT_CATCH_ALL_USAGE_PROFILE, 4, "CSP", true);
        console.log(result3);*/
    } catch(e) {
        console.log(e);
    }
})();


async function runExperimentation(testFile : string, usageFile : string, maxN : number, kind : "ID" | "CSP" | "SP" | "IS", actionWithValue : boolean, category : "Debut" | "Fin", optimize : boolean) {
    const debut = process.hrtime();
    const date = new Date();
    const dateString = `${date.getMonth()+1}_${date.getUTCDate()}_${date.getHours()}_${date.getMinutes()}`;
    const fileName = `./tmp/${kind}_${maxN}_${actionWithValue?"with":"without"}_${testFile.split('/').slice(-1)[0].split('.')[0]}_${usageFile.split('/').slice(-1)[0].split('.')[0]}_${dateString}`;
    const logFileName = `${fileName}.log`;
    //const logFileName = `${kind}_${testFile.split('/').slice(-1)[0].split('.')[0]}_${usageFile.split('/').slice(-1)[0].split('.')[0]}.log`;
    console.log(logFileName);
    const logger = createLogger(logFileName);
    const testSuiteDescription = await readTestSuiteDescriptionFromCSV(TEST_SUITE_FILE) as {NAME:string, TIME:string, Category: string }[];
    const usageProfile = createUsageProfileFromJSONFile(usageFile, actionWithValue);
    const testSuite = createTestSuiteFromJSONFile(testFile, testSuiteDescription, actionWithValue);

    const usageCoverageMatrix = new UsageCoverageMatrix(usageProfile, testSuite, kind, maxN, logger, optimize );
    usageCoverageMatrix.buildUsagePatterns();

    
    logger.info(`there are ${usageCoverageMatrix.usagePatterns.length} patterns`);

    usageCoverageMatrix.computeCoverage();

    const coverage = usageCoverageMatrix.getCoverage();
    logger.info(`total coverage is ${coverage}`);

    const frequency = usageCoverageMatrix.getUsagePatternsFrequency();
    logger.info(`frequency = ${frequency}`);

    exportUsageCoverageMatrixToCSV(usageCoverageMatrix, fileName+'.csv');

    const prioTestSuite = usageCoverageMatrix.prioritize();
    const misPrio = computeNumberOfMisprioritized(prioTestSuite, category);
    exportTestSuiteToCSV(prioTestSuite, fileName+'Ranked.csv');
    logger.info(`there are ${misPrio} mis prioritize tests`);

    const fin = process.hrtime(debut);

    return {
        kind,
        maxPatternSize: maxN,
        withAction: actionWithValue,
        fileName,
        time: fin,
        misprioritized: misPrio,
        numberOfUsageAction:usageCoverageMatrix.getUniqueUsageAction().length,
        numberOfTestAction:usageCoverageMatrix.getUniqueTestAction().length,
        numberOfUsageAndTestAction:usageCoverageMatrix.getUniqueActionInProfileAndTest().length,
        numberOfUsagePattern:usageCoverageMatrix.usagePatterns.length,
        totalFrequency:usageCoverageMatrix.getUsagePatternsFrequency(), 
        distributivity:usageCoverageMatrix.getPatternFrequencyDistributivity() 
    }
}


function createLogger(filename : string) {
    console.log(filename);
    const logLevel = 'info';

    let transports: any[] = 
    [
        new winston.transports.Console({level: 'info'}),
        new winston.transports.File({ filename  , level: 'debug' }),
    ]

    return winston.createLogger({
        level: logLevel,
        format: winston.format.json(),
        transports,
    });
}

function computeNumberOfMisprioritized(testSuite : TestSuite, category : "Debut" | "Fin") : number {
    let visitDebutTest = true;
    let numberOfMisprioritized = 0;
    for (let i = 0 ; i < testSuite.tests.length ; i++) {
        if (visitDebutTest) {
            if (testSuite.tests[i].category !== category) {
                visitDebutTest = false;
            }
        } else {
            if (testSuite.tests[i].category === category) {
                numberOfMisprioritized++;
            }
        }
    }
    return numberOfMisprioritized;
}

function identifyBuggyPatternsAtRandom(usagePatterns : UsagePattern[], percentageOfBuggy : number) {
    let bucket : number[] = [];
    let buggyPatterns : number[] = [];

    for (var i=0;i<=usagePatterns.length;i++) {
        bucket.push(i);
    }

    let numberOfBuggyPatterns;
    if (percentageOfBuggy < 0) {
        numberOfBuggyPatterns = 0;
    } else if (percentageOfBuggy > 1) {
        numberOfBuggyPatterns = usagePatterns.length;
    } else {
        numberOfBuggyPatterns = usagePatterns.length * percentageOfBuggy;
    }

    while (numberOfBuggyPatterns > 0) {
        let randomIndex = Math.floor(Math.random()*bucket.length);
        buggyPatterns.push(randomIndex);
        bucket.splice(randomIndex, 1)[0];
        --numberOfBuggyPatterns;
    }

    return buggyPatterns;

}

