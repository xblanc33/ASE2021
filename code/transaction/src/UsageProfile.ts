import UsagePath from "./UsagePath";

export default class UsageProfile {
    private _paths : UsagePath[]; 
    
    constructor() {
        this._paths = [];
    }

    addUsagePath(usagePath : UsagePath) {
        this._paths.push(usagePath);
    }

    get paths() : UsagePath[] {
        return [...this._paths];
    }

    toString() {
        return this._paths.map(usagePath => usagePath.toString()).join('\n');
    }

}