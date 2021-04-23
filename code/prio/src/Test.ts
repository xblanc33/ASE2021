import Action from "./Action";

export default class Test {
    private _actions : Action[];
    private _testerName : string;
    private _duration : number;
    private _category : string | undefined; 
    
    constructor( actions : Action[], testerName : string, duration ?:number, category ?:string) {
        this._actions = [...actions];
        this._testerName = testerName;
        if (duration) {
            this._duration = duration;
        } else {
            this._duration = Infinity;
        }
        this._category = category;
    }

    get actions() : Action[] {
        return [...this._actions];
    }

    get testerName() : string {
        return this._testerName;
    }

    get duration() : number {
        return this._duration;
    }

    get category() : string | undefined{
        return this._category;
    }

    toString() {
        return this._testerName + ':' + this._actions.map(action => action.toString()).join(' -> ') + `(${this._duration})`
    }

}