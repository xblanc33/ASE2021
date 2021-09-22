import Action from "./Action";

export default class Transaction {
    readonly actions : Action[];
    private  _occurence : number;

    constructor(actions : Action[]) {
        this.actions = actions;
        this._occurence = 1;
    }

    increment(increment : number) {
        this._occurence+=increment;
    }

    get key() {
        return this.actions.map(action => action.token).join(" -> ");
    }

    get occurence() {
        return this._occurence;
    }

    toString() {
        return this.key + " (" + this.occurence + ")";
    }
}