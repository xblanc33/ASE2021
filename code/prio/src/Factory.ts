import UsageProfile from "./UsageProfile";
import fs from "fs";
import Action from "./Action";
import UsagePath from "./UsagePath";
import TestSuite from "./TestSuite";
import Test from "./Test";
import csvParse from 'csv-parse';

export function createUsageProfileFromJSONFile(filePath : string, withValue : boolean = true) : UsageProfile{
    const rawdata = fs.readFileSync(filePath,"utf-8");
    const run : {
        explorationList:{
            testerName:string,
            interactionList:{
                concreteType:string, 
                kind:string, 
                value:string
            }[]
        }[]
    } = JSON.parse(rawdata);

    const usageProfile = new UsageProfile();
    run.explorationList.forEach(exploration => {
        const actions = exploration.interactionList.filter(interaction => interaction.kind !== "start" && interaction.kind !== "end").filter(interaction => interaction.concreteType === "Action")
        .map( action => {
            if (withValue) {
                return new Action(action.value?action.kind+'$'+action.value:action.kind);
            } else {
                return new Action(action.kind);
            }
        });
        const usagePath = new UsagePath(actions, exploration.testerName);
        usageProfile.addUsagePath(usagePath);
    });
    return usageProfile;
}


export function createTestSuiteFromJSONFile(filePath : string, testSuiteDescription: {NAME:string, TIME:string, Category: string }[], withValue : boolean = true) : TestSuite{
    const rawdata = fs.readFileSync(filePath,"utf-8");
    const run : {
        explorationList:{
            testerName:string,
            interactionList:{
                concreteType:string, 
                kind:string, 
                value:string
            }[]
        }[]
    } = JSON.parse(rawdata);
    const cleanRun = cleanRunTest(run);

    const testSuite = new TestSuite();
    cleanRun.explorationList.forEach(exploration => {
        const actions = exploration.interactionList.filter(interaction => interaction.kind !== "start" && interaction.kind !== "end").filter(interaction => interaction.concreteType === "Action")
        .map( action => {
            if (withValue) {
                return new Action(action.value?action.kind+'$'+action.value:action.kind);
            } else {
                return new Action(action.kind);
            }
        });
        const foundDescription = testSuiteDescription.find((description) => description.NAME === exploration.testerName);
        const duration = Number(foundDescription?.TIME);
        if (foundDescription) {
            if (!isNaN(duration)) {
                const test = new Test(actions, exploration.testerName, duration, foundDescription.Category);
                testSuite.addTest(test);
            } else {
                const test = new Test(actions, exploration.testerName, Infinity, foundDescription.Category);
                testSuite.addTest(test);
            }
        } 
    });
    return testSuite;
}


export function readTestSuiteDescriptionFromCSV(csvPath : string) {
    const buffer = fs.readFileSync(csvPath, "utf-8");
    return new Promise((resolve, reject) => {
        csvParse(buffer, {
            quote: '',
            columns: true,
            delimiter: ',',
            relax: true,
            skip_empty_lines: true
        }, (error, records) => {
            if (error) {
                reject(error);
            } else {
                resolve(records);
            }
        });
    });
}


function cleanRunTest(run : {explorationList:{
    testerName:string,
    interactionList:{
        concreteType:string, 
        kind:string, 
        value:string
    }[]
}[]}) : {explorationList:{
    testerName:string,
    interactionList:{
        concreteType:string, 
        kind:string, 
        value:string
    }[]
}[]} {
    const cleaned : {explorationList:{
        testerName:string,
        interactionList:{
            concreteType:string, 
            kind:string, 
            value:string
        }[]
    }[]} = {explorationList:[]};

    run.explorationList.forEach((exploration) => {
        const foundIndex = cleaned.explorationList.findIndex((cleanedExploration) => cleanedExploration.testerName === exploration.testerName);
        if (foundIndex === -1) {
            cleaned.explorationList.push(exploration);
        } else {
            if (exploration.interactionList.length > cleaned.explorationList[foundIndex].interactionList.length) {
                cleaned.explorationList.splice(foundIndex, 1, exploration);
            }
        }
    });
    return cleaned;

}