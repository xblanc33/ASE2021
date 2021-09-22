const EXPE_DIRECTORY = '../../expe/new';
import fs from "fs";
import Action from "./Action";
import CSPModel from "./CSPModel";
import { createUsageProfileFromDirecory } from "./Factory";
import Sequence from "./Sequence";
import { buildTransactionsFromUsageProfile, computeTestProbability, improveTest } from "./TransactionAnalysis";


(async() => {
    let usageProfile = createUsageProfileFromDirecory(EXPE_DIRECTORY,false);
    console.log('there are ' + usageProfile.paths.length + ' paths');

    let model = new CSPModel(5, 1, "id1");
    usageProfile.paths.forEach(path => {
        let seq = new Sequence(path.path);
        model.learnSequence(seq);
    });
    console.log('there are '+model.getAllNgram().length+' ngrams');

    const test = createTest();
    console.log('test : ', test.getActions().map(a => a.token).join(' -> '));
    
    const improvedTest = improveTest(test, model, 0.5);
    console.log('improved test : ', improvedTest.getActions().map(a => a.token).join(' -> '));
    // const proba = computeTestProbability(test, model);
    // console.log('proba : ' + proba);
    // for (let index = 0; index < test.getActions().length; index++) {
    //     const currentTestAction = test.getActions()[index];
    //     console.log('\ncurrent action is ' + currentTestAction.token);
    //     const context = test.getActions().slice(0, index + 1);
    //     console.log('context is ' + context.map(action => action.token).join(' -> '));
    //     const probaMap = model.getActionProbabilityMap(new Sequence(context));
    //     for (const [key,proba] of probaMap.entries()) {
    //         console.log(key + ": " + proba);
    //     }
    // }
    
    // const transactions = buildTransactionsFromUsageProfile(usageProfile, 3);
    // console.log('there are '+transactions.length+' transactions');

    // transactions.filter(tr => tr.actions.length > 1).sort((transA, transB) => transB.occurence - transA.occurence).slice(0, 10).forEach(transaction => {
    //     console.log(transaction);
    // });
})()

function createTest() {
    const test = new Sequence();
    test.addAction(new Action("start"));
    test.addAction(new Action("SearchClick"));
    test.addAction(new Action("SearchButtonClick"));
    test.addAction(new Action("ShowDescription"));
    test.addAction(new Action("CliquerAjouterAuPanierPageProduit"));
    return test;
}

function gatherAllTraces() {
    //read all files of the directory
    const files = fs.readdirSync(EXPE_DIRECTORY);
    //read JSON in file
    const tracesJSON = files.map(file => {
        const filePath = EXPE_DIRECTORY + '/' + file;
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContent);
    });
    let traces : any = [];
    tracesJSON.forEach(trace => traces.push(...trace.explorationList));
    return traces;
}

