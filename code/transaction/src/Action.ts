
export default class Action {
    private _token : string; 
    
    constructor( key : string) {
        this._token = key;
    }

    get token() : string {
        return this._token;
    }

    equalsTo(otherAction : Action) {
        return this._token === otherAction.token;
    }

    toString() {
        return this._token;
    }

}