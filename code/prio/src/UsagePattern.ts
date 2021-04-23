
export default class UsagePattern {
    private _key : string; 
    private _frequency : number;
    private _size : number;
    
    constructor( key : string, size : number) {
        this._key = key;
        this._size = size;
        this._frequency = 1;
    }

    get key() : string {
        return this._key;
    }

    get frequency() : number {
        return this._frequency;
    }

    get size() : number {
        return this._size;
    }

    incrementFrequency(increment : number) {
        this._frequency+=increment;
    }

    toString() {
        return this._key;
    }

}