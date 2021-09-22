import Ngram from "./Ngram";
import Sequence from "./Sequence";
import Action from "./Action";
import TreeCSP from "./TreeCSP";
import Model from "./Model";

export default class CSPModel extends Model  {

    private _treeMap: Map <string, TreeCSP>;
    private readonly _interpolationfactor: number;

    constructor(depth: number, interpolationfactor: number= 2, id: string) {
        super(depth, id)
        this._interpolationfactor = interpolationfactor;

        this._treeMap = new Map();
    }

    get interpolationfactor(): number {
        return this._interpolationfactor;
    }

    // For testing purpose
    public getTreeByAction(action: Action): TreeCSP | undefined {
        return this._treeMap.get(action.token);
    }

    public learnSequence(sequence: Sequence): void {
        while (sequence.length > 0) {
            const context = this.fitContextToDepth(sequence.getContext());
            if (context.length === 0) {
                return;
            }
            const [prefix, last] = sequence.cloneAndPop();
            if (last instanceof Action) {
                this.contextOccurs(context);
                this.addActionKnowingContext(last, this.fitContextToDepth(prefix.getContext()));
            }
            sequence = prefix;
        }
    }


    public getActionProbabilityMap(sequence: Sequence): Map<string, number> {
        const context = sequence.getContext()
        if (context.length === 0) {
            throw new Error("cannot getStimulusProbabilityMap, sequence's context is empty");
        }
        const lastActionOfContext = context[context.length - 1];
        if (! this._treeMap.has(lastActionOfContext.token)) {
            return new Map();
        } else {
            const tree = this._treeMap.get(lastActionOfContext.token);
            if (! tree) {
                return new Map();
            } else {
                return tree.getActionInterpolatedProbabilityMap(context, this.interpolationfactor);
            }
        }
    }

    public getAllNgram(): Ngram[] {
        const ngrams : Ngram[] = [];
        for (const tree of this._treeMap.values()) {
            tree.getAllNgram().forEach( (ngram) => {
                ngrams.push(ngram);
            });
        }
        return ngrams;
    }

    private contextOccurs(context: Action[]): void {
        const lastStimulusOfContext = context[context.length - 1];
        const tree = this.findTreeByAction(lastStimulusOfContext);
        tree.contextOccurs(context);
    }

    private addActionKnowingContext(action: Action, context: Action[]): void {
        if (context.length !== 0) {
            const lastActionOfContext = context[context.length - 1];
            const tree = this.findTreeByAction(lastActionOfContext);
            tree.learnActionKnowingContext(action, context);
        }
    }

    private findTreeByAction(action: Action): TreeCSP {
        let tree = this._treeMap.get(action.token);
        if (!tree) {
            tree = new TreeCSP(action);
            this._treeMap.set(action.token, tree);
        }
        return tree;
    }

}
