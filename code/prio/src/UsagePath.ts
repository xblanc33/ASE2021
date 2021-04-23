import Action from "./Action";

export default class UsagePath {
    private _path : Action[];
    private _userName : string;
    
    constructor( path : Action[], userName : string) {
        this._path = [...path];
        this._userName = userName;
    }

    get path() : Action[] {
        return [...this._path];
    }

    get userName() : string {
        return this._userName;
    }

    toString() {
        return this._path.map(action => action.toString()).join(' -> ');
    }

}