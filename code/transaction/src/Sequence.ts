import Action from "./Action";

export default class Sequence {
    private _sequence: Array<Action>;

    constructor(sequence: Array<Action> = []) {
        this._sequence = sequence;
    }

    get length(): number {
        return this._sequence.length;
    }

    public addAction(action: Action): void {
        this._sequence.push(action);
    }

    public getActions():Action[] {
        return this._sequence;
    }

    public getContext(): Action[] {
        return this._sequence.filter( (element) => element instanceof Action);
    }

    public cloneAndPop(): [Sequence,Action | undefined] {
        if (this._sequence.length > 0 ) {
            const clone = new Sequence();
            clone._sequence = this._sequence.slice();
            const pop = clone._sequence.pop();
            return [clone, pop];
        } else {
            return [this, undefined];
        }
    }

    public cloneAndShift(): [Sequence, Action | undefined] {
        if (this._sequence.length > 0 ) {
            const clone = new Sequence();
            clone._sequence = this._sequence.slice();
            const first = clone._sequence.shift();
            return [clone, first];
        } else {
            return [this, undefined];
        }
    }

}
