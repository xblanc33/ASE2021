import Action from "./Action";
import CSPModel from "./CSPModel";
import Sequence from "./Sequence";
import Transaction from "./Transaction";
import UsagePath from "./UsagePath";
import UsageProfile from "./UsageProfile";

export function buildTransactionsFromUsageProfile(usageProfile : UsageProfile, transactionMaxSize : number) : Transaction[] {
    const createdTransactions : Transaction[] = [];
    usageProfile.paths.forEach(usagePage => {
        const transacionsOfUsagePath = buildTransactionsFromUsagePath(usagePage, transactionMaxSize);
        transacionsOfUsagePath.forEach(transaction => {
            const foundIndex = createdTransactions.findIndex((foundPattern) => foundPattern.key === transaction.key);
            if (foundIndex == -1) {
                createdTransactions.push(transaction);
            } else {
                createdTransactions[foundIndex].increment(transaction.occurence);
            }
        });
    });
    return createdTransactions;
}


export function buildTransactionsFromUsagePath(usagePath : UsagePath, transactionMaxSize : number) : Transaction[] {
    const createdTransactions : Transaction[] = [];
    for (let transactionSize = 1 ; transactionSize <= transactionMaxSize ; transactionSize++) {
        for (let index = 0 ; index + transactionSize <= usagePath.path.length ; index++) {
            const candidateTransaction = new Transaction(usagePath.path.slice(index,index+transactionSize));
            const foundIndex = createdTransactions.findIndex((foundPattern) => foundPattern.key === candidateTransaction.key);
            if (foundIndex == -1) {
                createdTransactions.push(candidateTransaction);
            } else {
                createdTransactions[foundIndex].increment(1);
            }
        }
    }
    return createdTransactions;
}

export function improveTest(test : Sequence, model : CSPModel, improvmentRatioThreshold : number) : Sequence{
    let improvedHead = [test.getActions()[0]];
    for (let index = 1; index < test.getActions().length; index++) {
        const actionToImprove = test.getActions()[index];
        const context = new Sequence(test.getActions().slice(0, index));
        const probabilities = model.getActionProbabilityMap(context);
        const probaToImprove = probabilities.get(actionToImprove.token) || 0;
        let improved = false;
        for (const [key,proba] of probabilities.entries()) {
            if (actionToImprove.token !== key && probaToImprove < proba) {
                const currentImprovedActions = [...improvedHead];
                const candidateImprovedActions = [...improvedHead]; 
                currentImprovedActions.push(actionToImprove);
                candidateImprovedActions.push(new Action(key));
                if (index !== test.getActions().length - 1) {
                    currentImprovedActions.push(...test.getActions().slice(index+1));
                    candidateImprovedActions.push(...test.getActions().slice(index+1));
                }
                let currentImprovedSequence = new Sequence(currentImprovedActions);
                let candidateImprovedSequence = new Sequence(candidateImprovedActions);
                const currentProba = computeTestProbability(currentImprovedSequence, model);
                const candidateProba = computeTestProbability(candidateImprovedSequence, model);
                if (currentProba < candidateProba * improvmentRatioThreshold) {
                    improvedHead.push(new Action(key));
                    improved = true;
                    break;
                }
            }
        }
        if (!improved) {
            improvedHead.push(actionToImprove);
        }
    }
    return new Sequence(improvedHead);
}

export function computeTestProbability(test : Sequence, model : CSPModel) : number {
    let proba = 1;
    for (let index = 1; index < test.getActions().length; index++) {
        const actionToImprove = test.getActions()[index];
        const context = new Sequence(test.getActions().slice(0, index));
        const probabilities = model.getActionProbabilityMap(context);
        const actionProba = probabilities.get(actionToImprove.token) || 0;
        //console.log(actionToImprove.token, actionProba);
        proba *= actionProba;
    }
    return proba;
}
