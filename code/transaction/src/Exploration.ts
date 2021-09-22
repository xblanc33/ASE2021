import Action from "./Action";

export default class Exploration {
    private _actions : Action[];
    
    constructor( actions : Action[]) {
        this._actions = [...actions];
    }

    get actions() : Action[] {
        return [...this._actions];
    }

    toString() {
        return this._actions.map(action => action.toString()).join(' -> ');
    }

}