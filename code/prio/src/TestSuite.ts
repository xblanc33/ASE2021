import Test from "./Test";


export default class TestSuite {
    private _tests : Test[]; 
    
    constructor() {
        this._tests = [];
    }

    addTest(test : Test) {
        this._tests.push(test);
    }

    get tests() : Test[] {
        return [...this._tests];
    }

    toString() {
        return this._tests.map(test => test.toString()).join('\n');
    }

}