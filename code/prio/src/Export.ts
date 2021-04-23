import {Parser} from "json2csv";
import fs from "fs";
import csvParse from 'csv-parse';
import UsageCoverageMatrix from "./UsageCoverageMatrix";
import TestSuite from "./TestSuite";
import { parentPort } from "worker_threads";

export function exportUsageCoverageMatrixToCSV(matrix : UsageCoverageMatrix, filename : string) {
    const fields = ['id', 'tester', 'duration', 'coverage', 'category'];
    fields.push(...matrix.usagePattern.map((pattern)=>`${pattern.key} (${pattern.frequency}) `))
    const opts = { fields };

    try {
        const parser = new Parser(opts);
        const csv = parser.parse(matrixToJSON(matrix));
        fs.writeFileSync(filename, csv);
    } catch (err) {
        console.error(err);
    }
}


function matrixToJSON(matrix : UsageCoverageMatrix) {
    return matrix.testSuite.tests.map((test,index) => {
        let testJSON : any= {
            id : index,
            tester : test.testerName,
            duration : test.duration,
            coverage : matrix.getCoverageForTesterName(test.testerName),
            category : test.category
        }
        const coverageVector = matrix.getCoverageVectorForTesterName(test.testerName);
        if (coverageVector) {
            matrix.usagePattern.map((pattern)=>`${pattern.key} (${pattern.frequency}) `).forEach((field,index)=>{
                testJSON[field] = coverageVector[index]?'ok':'nok';
            })
        }
        return testJSON;
    })
}


export function exportTestSuiteToCSV(testSuite : TestSuite, filename : string) {
    const fields = ['id', 'tester', 'duration', 'category'];
    const opts = { fields };

    try {
        const parser = new Parser(opts);
        const csv = parser.parse(testSuite.tests.map((test, index) => {
            return {
                id: index,
                tester: test.testerName,
                duration: test.duration,
                category: test.category
            }
        }));
        fs.writeFileSync(filename, csv);
    } catch (err) {
        console.error(err);
    }
}

export function exportExperimentationResultsToCSV(results:{
    kind: string,
    maxPatternSize: number,
    withAction: boolean,
    fileName: string,
    time: number[],
    misprioritized: number,
    numberOfUsageAction: number,
    numberOfTestAction: number,
    numberOfUsageAndTestAction: number,
    numberOfUsagePattern: number,
    totalFrequency: number
}[], filename : string) {
    const fields = ['kind', 
    'maxPatternSize', 
    'withAction',
    'fileName',
    'time',
    'misprioritized',
    'numberOfUsageAction',
    'numberOfTestAction',
    'numberOfUsageAndTestAction',
    'numberOfUsagePattern',
    'totalFrequency'];
    const opts = { fields };

    try {
        const parser = new Parser(opts);
        const csv = parser.parse(results);
        fs.writeFileSync(filename, csv);
    } catch (err) {
        console.error(err);
    }


}


