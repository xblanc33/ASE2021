import Action from "./Action";

export default class Ngram {
    private readonly _ngram: Action[];
    private _occurence: number;
    private _successors: Map<string, number>;

    constructor(ngram: Action[], occurence: number) {
        this._ngram = ngram;
        this._occurence = occurence;
        this._successors = new Map();
    }

    get n(): number {
        return this._ngram.length;
    }

    get key(): string {
        return this._ngram.map((action) => action.token).join(" -> ");
    }

    get ngram(): Action[] {
        return [...this._ngram];
    }

    get occurence(): number {
        return this._occurence;
    }

    get successors(): Map<string, number> {
        return new Map(this._successors);
    }

    public addSuccessor(action: Action, occurence: number): void {
        this._successors.set(action.token, occurence);
    }
    
}
