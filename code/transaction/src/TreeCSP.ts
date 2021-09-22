import Ngram from "./Ngram";
import Action from "./Action";

export default class TreeCSP {
    private _action: Action;
    private _prefixActionToTreeCSP: Map<string, TreeCSP>;
    private _successorsOccurence: number;
    private _occurence: number;
    private _successorToOccurence: Map<string, number>;
    
    constructor(action: Action) {
        this._occurence = 0;
        this._action = action;
        this._prefixActionToTreeCSP = new Map(); // <Action,Tree>
        this._successorsOccurence = 0;
        this._successorToOccurence = new Map(); // <Stimulus,Number>
    }

    get action(): Action {
        return this._action;
    }

    get occurence(): number {
        return this._occurence;
    }

    get successors(): Action[] {
        return [...this._successorToOccurence.keys()].map((key) => new Action(key));
    }

    get successorsOccurence(): number {
        return this._successorsOccurence;
    }

    public getSuccessorOccurence(action: Action): number | undefined{
        return this._successorToOccurence.get(action.token);
    }

    get prefixes(): Action[] {
        return [...this._prefixActionToTreeCSP.keys()].map( (key) => new Action(key));
    }

    // for testing purpose only !
    public getPrefixTreeByAction(action: Action): TreeCSP | undefined{
        return this._prefixActionToTreeCSP.get(action.token);
    }

    public getAllNgram(): Ngram[] {
        const ngramSet: Ngram[] = [];
        for (const tree of this._prefixActionToTreeCSP.values()) {
            const subNgramSet = tree.getAllNgram();
            subNgramSet.forEach((subNgram) => {
                const stimulusSet = subNgram.ngram;
                stimulusSet.push(this.action);
                const ngram = new Ngram(stimulusSet, subNgram.occurence);
                for (const [key, occurence] of subNgram.successors.entries()) {
                    ngram.addSuccessor(new Action(key), occurence);
                }
                ngramSet.push(ngram);
            });
        }
        const ngram = new Ngram([this._action], this._occurence);
        for (const [key, occurence] of this._successorToOccurence.entries()) {
            ngram.addSuccessor(new Action(key), occurence);
        }
        ngramSet.push(ngram);
        return ngramSet;
    }

    public contextOccurs(context: Action[]): void {
        if (context.length === 0) {
            return;
        }
        const lastAction = context[context.length - 1];
        if (lastAction.token !== this._action.token) {
            return;
        }

        this._occurence++;

        if (context.length > 1) {
            const prefixContext = context.slice(0, context.length - 1);
            const lastActionOfPrefixContext = prefixContext[prefixContext.length - 1];
            if (!this._prefixActionToTreeCSP.has(lastActionOfPrefixContext.token)) {
                const prefixTree = new TreeCSP(lastActionOfPrefixContext);
                this._prefixActionToTreeCSP.set(lastActionOfPrefixContext.token, prefixTree);
            }
            this._prefixActionToTreeCSP.get(lastActionOfPrefixContext.token)?.contextOccurs(prefixContext);
        }

    }

    public addSuccessor(action: Action): void {
        if (this._successorToOccurence.has(action.token)) {
            let occurenceSuccessor = this._successorToOccurence.get(action.token);
            if (occurenceSuccessor !== undefined) {
                occurenceSuccessor++;
                this._successorToOccurence.set(action.token, occurenceSuccessor);
            } 
        } else {
            this._successorToOccurence.set(action.token, 1);
        }
        this._successorsOccurence++;
    }

    public learnActionKnowingContext(stimulus: Action, context: Action[]): void {
        if (context.length === 0) {
            return;
        }

        const lastAction = context[context.length - 1];
        if (lastAction.token !== this._action.token) {
            return;
        }

        this.addSuccessor(stimulus);

        if (context.length > 1) {
            const prefixContext = context.slice(0, context.length - 1);
            const lastActionOfPrefixContext = prefixContext[prefixContext.length - 1];
            if (!this._prefixActionToTreeCSP.has(lastActionOfPrefixContext.token)) {
                const prefixTree = new TreeCSP(lastActionOfPrefixContext);
                this._prefixActionToTreeCSP.set(lastActionOfPrefixContext.token, prefixTree);
            }
            this._prefixActionToTreeCSP.get(lastActionOfPrefixContext.token)?.learnActionKnowingContext(stimulus, prefixContext);
        }
    }

    public getActionProbability(action: Action, context: Action[]): number {
        if (context.length === 0) {
            return 0;
        }
        const lastAction = context[context.length - 1];
        if (lastAction.token !== this._action.token) {
            return 0;
        }
        if (!this._successorToOccurence.has(action.token)) {
            return 0;
        }
        if (context.length === 1 ) {
            let succOccurences = this._successorToOccurence.get(action.token);
            if (succOccurences === undefined) {
                return 0;
            } else {
                return succOccurences / this._successorsOccurence;
            }
        } else {
            const prefixAction = context[context.length - 2];
            const prefixContext = context.slice(0, context.length - 1);
            const prefix = this._prefixActionToTreeCSP.get(prefixAction.token);
            if (! prefix) {
                return 0;
            } else {
                return prefix.getActionProbability(action, prefixContext);

            }
        }
    }

    public getActionProbabilities(action: Action, context: Action[]): number[] {
        const list : number[] = [];
        if (context.length === 0 ) {
            return list;
        }
        if (context[context.length - 1].token !== this._action.token) {
            return list;
        }

        const occAction = this._successorToOccurence.get(action.token);
        if (occAction === undefined || occAction === 0 ) {
            list.push(0);
        } else {
            list.push(occAction / this._successorsOccurence);
        }

        if (context.length > 1) {
            const lastAction = context[context.length - 2];

            if (this._prefixActionToTreeCSP.has(lastAction.token)) {
                const prefix = this._prefixActionToTreeCSP.get(lastAction.token);
                if (prefix !== undefined) {
                    list.push(...prefix.getActionProbabilities(action, context.slice(0, context.length - 1)));
                }
            }
        }

        return list;
    }

    public getActionInterpolatedProbabilityMap(context: Action[], factor: number): Map<string, number> {
        const interpolatedProbabilityMap = new Map();
        if (context.length === 0) {
            return interpolatedProbabilityMap;
        }
        const lastAction = context[context.length - 1];

        if (lastAction.token !== this._action.token) {
            return interpolatedProbabilityMap;
        }
        let sumProba = 0;

        for (const key of Array.from(this._successorToOccurence.keys())) {
            const keyProbaList = this.getActionProbabilities(new Action(key), context);

            const keyProba = keyProbaList.reduce( (pre, cur, index) => {
                return pre + cur * Math.pow(factor, index);
            }, 0);

            interpolatedProbabilityMap.set(key, keyProba);

            sumProba += keyProba;
        }
        for (const key of Array.from(interpolatedProbabilityMap.keys())) {
            const interProba = interpolatedProbabilityMap.get(key) / sumProba;
            interpolatedProbabilityMap.set(key, interProba);
        }
        return interpolatedProbabilityMap;
    }

}