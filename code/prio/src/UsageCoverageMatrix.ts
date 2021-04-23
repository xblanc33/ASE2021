import Action from "./Action";
import TestSuite from "./TestSuite";
import UsagePath from "./UsagePath";
import UsagePattern from "./UsagePattern";
import UsageProfile from "./UsageProfile";
import Test from "./Test";
import * as winston from "winston";


const ID_SEPARATOR = ' -> ';
const CSP_SEPARATOR = ' -> ';
const SP_SEPARATOR = ' .* ';
const IS_SEPARATOR = ' ;; ';

const USELESS_ACTION = "useless";

export default class UsageCoverageMatrix  {
    private _usageProfile : UsageProfile;
    private _optimizedUsageProfile : UsageProfile | undefined;
    private _optimize : boolean; 
    private _testSuite : TestSuite;
    private _kind : "ID" | "CSP" | "SP" | "IS";
    private _maxN : number;
    private _usagePatternAreCreated : boolean;
    private _testCoverageIsComputed : boolean;
    private _usagePattern : UsagePattern[];
    private _coverageByTesterName : Map<string,boolean[]>;
    private _logger : winston.Logger;


    constructor(usageProfile : UsageProfile, testSuite : TestSuite, kind : "ID" | "CSP" | "SP" | "IS", maxN : number, logger :  winston.Logger, optimize : boolean) { 
        this._usageProfile = usageProfile;
        this._testSuite = testSuite;
        this._kind = kind;
        this._maxN = maxN;
        this._usagePatternAreCreated = false;
        this._testCoverageIsComputed = false;
        this._usagePattern = [];
        this._coverageByTesterName = new Map();
        this._logger = logger;
        this._optimize = optimize;
    }

    get usagePattern() : UsagePattern[] {
        return this._usagePattern;
    }

    get testSuite() : TestSuite {
        return this._testSuite;
    }

    get optimizedUsageProfile() : UsageProfile | undefined {
        return this._optimizedUsageProfile;
    }

    optimizeUsageProfileByRemovingActionsNotTested() {
        
        const testedActions = this.getUniqueTestAction();
        const optimizedUsageProfile = new UsageProfile();
        this._usageProfile.paths.forEach((usagePath) => {
            const cleanPath = usagePath.path.reduce<Action[]>((cleanPath, action) => {
                if (testedActions.find((testedAction) => testedAction.equalsTo(action))) {
                    cleanPath.push(action);
                } else {
                    cleanPath.push(new Action(USELESS_ACTION));
                }
                return cleanPath;
            }, []);
            optimizedUsageProfile.addUsagePath(new UsagePath(cleanPath,usagePath.userName));
        })
        this._optimizedUsageProfile = optimizedUsageProfile;
        this._logger.info('optimized ok')
    }

    buildUsagePatterns() {
        if (!this._usagePatternAreCreated) {
            if (this._optimize) {
                if (!this._optimizedUsageProfile) {
                    this.optimizeUsageProfileByRemovingActionsNotTested();
                }
                this._logger.info('optimized');
            } else {
                this._logger.info('not optimized');
                this._optimizedUsageProfile = this._usageProfile;
            }
            if (this._optimizedUsageProfile) {
                this._optimizedUsageProfile.paths.forEach((usagePath) => {
                    const begin = process.hrtime();
                    let createdUsagePatterns : UsagePattern[] | undefined;
                    switch (this._kind) {
                        case "ID":
                            createdUsagePatterns = this.buildIDUsagePatterns(usagePath); 
                            break;
                        case "CSP":
                            createdUsagePatterns = this.buildCSPUsagePatterns(usagePath); 
                            break;
                        case "SP":
                            createdUsagePatterns = this.buildSPUsagePatterns(usagePath); 
                            break;
                        case "IS":
                            createdUsagePatterns = this.buildISUsagePatterns(usagePath); 
                            break;
                    }
                    createdUsagePatterns.forEach((usagePattern) => {
                        const index = this._usagePattern.findIndex((foundPattern) => foundPattern.key === usagePattern.key);
                        if (index === -1)  {
                            this._usagePattern.push(usagePattern);
                        } else {
                            this._usagePattern[index].incrementFrequency(1);
                        }
                    })
                    this._logger.debug({
                        task:'buildUsagePath',
                        kind: this._kind,
                        pathSize: usagePath.path.length,
                        path: usagePath.path.map((action) => action.key).join(' >> '),
                        duration: process.hrtime(begin)
                    })
                })
                this._usagePatternAreCreated = true;
            } else {
                throw new Error('optimization problem');
            }
        }
    }



    private buildIDUsagePatterns(usagePath : UsagePath) : UsagePattern[]{
        const createdUsagePatterns : UsagePattern[] = [];
        const pattern = usagePath.path.map((action) => action.key).join(ID_SEPARATOR);
        const foundIndex = createdUsagePatterns.findIndex((foundPattern) => foundPattern.key === pattern);
        if (foundIndex == -1) {
            createdUsagePatterns.push(new UsagePattern(pattern, usagePath.path.length));
        } 
        return createdUsagePatterns;       
    }
    
    private buildCSPUsagePatterns(usagePath : UsagePath) : UsagePattern[] {
        const createdUsagePatterns : UsagePattern[] = [];
        for (let patternSize = 1 ; patternSize <= this._maxN ; patternSize++) {
            for (let index = 0 ; index + patternSize <= usagePath.path.length ; index++) {
                const patternKey = usagePath.path.slice(index,index+patternSize).map((action) => action.key).join(CSP_SEPARATOR);
                const foundIndex = createdUsagePatterns.findIndex((foundPattern) => foundPattern.key === patternKey);
                if (foundIndex == -1) {
                    createdUsagePatterns.push(new UsagePattern(patternKey, patternSize));
                }
            }
        }
        return createdUsagePatterns;
    }
    
    private buildSPUsagePatterns(usagePath : UsagePath) : UsagePattern[] {
        const createdUsagePatterns : UsagePattern[] = [];
        const usagePatternForThisPath : UsagePattern[] = [];
        this.buildSPUsagePatternsFromPath(usagePath.path, this._maxN).forEach((usagePattern) => {
            const foundIndex = usagePatternForThisPath.findIndex((foundPattern) => foundPattern.key === usagePattern.key);
            if (foundIndex == -1) {
                usagePatternForThisPath.push(usagePattern);
            }
        })
        usagePatternForThisPath.forEach((usagePattern) => {
            const foundIndex = createdUsagePatterns.findIndex((foundPattern) => foundPattern.key === usagePattern.key);
            if (foundIndex == -1) {
                createdUsagePatterns.push(usagePattern);
            }
        })
        return createdUsagePatterns; 
    }

    private buildSPUsagePatternsFromPath(path : Action[], n : number) : UsagePattern[] {
        if (path.length === 0) {
            return [];
        }
        if (path.length === 1) {
            return [new UsagePattern(path[0].key,1)];
        }
        const usagePatterns : UsagePattern[]= [];
        if (path[0].key !== USELESS_ACTION) {
            usagePatterns.push(new UsagePattern(path[0].key,1));
        }
        const subPatterns = this.buildSPUsagePatternsFromPath(path.slice(1),n);
        subPatterns.forEach((subPattern) => {
            if (!subPattern.key.includes(USELESS_ACTION)) {
                usagePatterns.push(subPattern);
                if (path[0].key !== USELESS_ACTION && subPattern.size < n) {
                    const patternKey = path[0].key + SP_SEPARATOR + subPattern.key;
                    usagePatterns.push(new UsagePattern(patternKey, subPattern.size + 1));
                }
            }
        });
        return usagePatterns;
    }

    private buildISUsagePatterns(usagePath : UsagePath) : UsagePattern[] {
        const usagePatternForThisPath : UsagePattern[] = [];
        this.buildISUsagePatternsFromPath(usagePath.path, this._maxN).forEach((usagePattern) => {
            const foundIndex = usagePatternForThisPath.findIndex((foundPattern) => foundPattern.key === usagePattern.key);
            if (foundIndex == -1) {
                usagePatternForThisPath.push(usagePattern);
            }
        })
        return usagePatternForThisPath;
    }

    private buildISUsagePatternsFromPath(path : Action[], n : number) : UsagePattern[] {
        if (path.length === 0) {
            return [];
        }
        if (path.length === 1) {
            if (path[0].key !== USELESS_ACTION) {
                return [new UsagePattern(path[0].key,1)];
            } else {
                return [];
            }
        }
        const usagePatterns : UsagePattern[]= [];
        
        const subPatterns = this.buildISUsagePatternsFromPath(path.slice(1),n);
        subPatterns.forEach((subPattern) => {
            if (!subPattern.key.includes(USELESS_ACTION)) {
                usagePatterns.push(subPattern);
                if (path[0].key != USELESS_ACTION && subPattern.size < n && !subPattern.key.includes(path[0].key.trim())) {
                    const keys = subPattern.key.split(IS_SEPARATOR).map(key=>key.trim());
                    keys.push(path[0].key);
                    usagePatterns.push(new UsagePattern(keys.sort().join(IS_SEPARATOR), keys.length));
                }
            }
        });

        if (path[0].key !== USELESS_ACTION && !usagePatterns.find((pattern) => pattern.key === path[0].key)) {
            usagePatterns.push(new UsagePattern(path[0].key,1));
        }
        return usagePatterns;
    }

    computeCoverage() {
        if (this._usagePatternAreCreated) {
            this._testSuite.tests.forEach((test) => {
                const begin = process.hrtime();
                switch (this._kind) {
                    case "ID":
                        this.computeCoverageForIDUsagePatterns(test); 
                        break;
                    case "CSP":
                        this.computeCoverageForCSPUsagePatterns(test); 
                        break;
                    case "SP":
                        this.computeCoverageForSPUsagePatterns(test); 
                        break;
                    case "IS":
                        this.computeCoverageForISUsagePatterns(test); 
                        break;
                }
                this._logger.debug({
                    task:'computCoverageForTest',
                    kind: this._kind,
                    testerName: test.testerName,
                    testSize: test.actions.length,
                    duration: process.hrtime(begin)
                })
                this._testCoverageIsComputed = true;
            })
        }
    }


    private computeCoverageForIDUsagePatterns(test : Test) {
        const testKey = test.actions.map((action) => action.key).join(ID_SEPARATOR);
        this._coverageByTesterName.set(test.testerName, this._usagePattern.map((pattern) => testKey === pattern.key));
    } 
    
    private computeCoverageForCSPUsagePatterns(test : Test) {
        const testKey = test.actions.map((action) => action.key).join(CSP_SEPARATOR);
        this._logger.debug({testKey})
        this._coverageByTesterName.set(test.testerName, this._usagePattern.map((pattern) => testKey.includes(pattern.key)));
    }
    
    private computeCoverageForSPUsagePatterns(test : Test) {
        this._coverageByTesterName.set(test.testerName, this._usagePattern.map((pattern) => {
            const patternKeys = pattern.key.split(SP_SEPARATOR).map(key => key.trim());
            let testKeys = test.actions.map(action => action.key);
            for (let i = 0 ; i < patternKeys.length ; i++) {
                const index = testKeys.indexOf(patternKeys[i]);
                if (index === -1) {
                    return false;
                } else {
                    testKeys.splice(0, index + 1);
                }
            }
            return true;
            }));
    }

    private computeCoverageForISUsagePatterns(test : Test) {
        this._coverageByTesterName.set(test.testerName, this._usagePattern.map((pattern) => {
            const patternKeys = pattern.key.split(IS_SEPARATOR).map(key => key.trim());
            let testKeys = test.actions.map(action => action.key);
            for (let i = 0 ; i < patternKeys.length ; i++) {
                if (!testKeys.includes(patternKeys[i])) {
                    return false;
                }
            }
            return true;
        }));
    }

    getCoverageForTesterName(testerName : string) : number {
        if (this._testCoverageIsComputed) {
            const coverageVector = this._coverageByTesterName.get(testerName);
            if (coverageVector) {
                const [occurence, totalOccurence] = coverageVector.reduce<[number,number]>((acc, curr, index) => {
                    acc[1]+=this._usagePattern[index].frequency;
                    if (curr) {
                        acc[0]+=this._usagePattern[index].frequency;
                    }
                    return acc;
                }, [0,0]);
                return occurence / totalOccurence;
            } else {
                return -1;
            }
        } else {
            return -1;
        }
    }

    getCoverageVectorForTesterName(testerName : string) : boolean[] | undefined {
        if (this._testCoverageIsComputed) {
            return this._coverageByTesterName.get(testerName);
        }
    }

    isUsagePatternCovered(usagePattern : UsagePattern) : boolean {
        if (this._testCoverageIsComputed) {
            const index = this._usagePattern.indexOf(usagePattern);
            for (let i = 0 ; i < this._testSuite.tests.length ; i++) {
                const test = this._testSuite.tests[i];
                const testCoverage = this._coverageByTesterName.get(test.testerName);
                if (testCoverage && testCoverage[index]) {
                    return true;
                }
            }
            return false;
        } else {
            return false;
        }
    }

    getCoverage() : number {
        if (this._testCoverageIsComputed) {
            const coveredFrequency = this._usagePattern.reduce<number>((acc, curr) => {
                if (this.isUsagePatternCovered(curr)) {
                    return acc + curr.frequency;
                } else {
                    return acc;
                }
            },0);
            return coveredFrequency / this.getUsagePatternsFrequency();
        } else {
            return -1;
        }
    }

    getUsagePatternsFrequency() : number{
        if (this._usagePatternAreCreated) {
            return this._usagePattern.reduce<number>((acc,curr) => {
                return acc + curr.frequency
            }, 0);
        } else {
            return -1;
        }
    }

    prioritize() {
        const begin = process.hrtime();
        
        const prioritizedTestSuite = new TestSuite();
        let tests: Test[] = [...this._testSuite.tests];

        while (tests.length > 0) {
            let maxScore = this.computeTestScore(tests[0])
            let maxTestCase = tests[0];
            let maxIndex = 0;

            for (let i = 1; i < tests.length; i++) {
                const currentTest = tests[i];
                const score = this.computeTestScore(currentTest);
                if (score > maxScore) {
                    maxScore = score;
                    maxTestCase = currentTest;
                    maxIndex = i;
                }
            }
            prioritizedTestSuite.addTest(maxTestCase);
            tests.splice(maxIndex, 1)
            //ngramsToCover = updateNotCoveredNgrams(ngramsToCover, maxTestCase.sequence, N)
        }
        this._logger.info({
            task:'priotitize',
            kind: this._kind,
            duration: process.hrtime(begin)
        })
        return prioritizedTestSuite;

    }

    computeTestScore(test : Test): number {
        let coverage = this.getCoverageForTesterName(test.testerName);
        let frequency = this.getUsagePatternsFrequency();
        return (coverage/frequency) / test.duration;
    }

    getUniqueUsageAction() : Action[] {
        return this._usageProfile.paths.reduce<Action[]>((acc,curr) => {
            curr.path.forEach((action) => {
                if (!acc.find((accAction) => accAction.equalsTo(action))) {
                    acc.push(action);
                }
            })
            return acc;
        }, [])
    }

    getUniqueTestAction() : Action[] {
        return this._testSuite.tests.reduce<Action[]>((acc,curr) => {
            curr.actions.forEach((action) => {
                if (!acc.find((accAction) => accAction.equalsTo(action))) {
                    acc.push(action);
                }
            })
            return acc;
        }, [])
    }

    getUniqueActionInProfileAndTest() : Action[] {
        const profileActions = this.getUniqueUsageAction();
        const testActions = this.getUniqueTestAction();

        return testActions.reduce<Action[]>((actions,testAction) => {
            if (profileActions.find((profileAction) => profileAction.equalsTo(testAction))) {
                actions.push(testAction);
            }
            return actions;
        }, [])
    }

    getPatternFrequencyDistributivity() : number[][] {
        return this._usagePattern.reduce<number[][]>((acc, curr) => {
            if (acc[curr.size-1] === undefined) {
                acc[curr.size-1] = [1, curr.frequency, curr.frequency];
            } else {
                acc[curr.size-1] = [acc[curr.size-1][0] + 1, acc[curr.size-1][1]+curr.frequency, Math.max(acc[curr.size-1][2], curr.frequency)];
            }
            return acc
        }, []);
        
    }
    
}