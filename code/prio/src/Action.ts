
export default class Action {
    private _key : string; 
    
    constructor( key : string) {
        this._key = key;
    }

    get key() : string {
        return this._key;
    }

    equalsTo(otherAction : Action) {
        return this._key === otherAction.key;
    }

    toString() {
        return this._key;
    }

}