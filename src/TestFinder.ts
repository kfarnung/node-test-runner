import * as fs from "fs";
import * as path from "path";
import KnownIssuesTestSuite from "./KnownIssuesTestSuite";
import TestSuite from "./TestSuite";

class TestFinder {
    private readonly _testRoot: string;
    private _suiteNames: string[];

    constructor(testRoot: string, suiteNames: string[] = []) {
        this._testRoot = path.resolve(testRoot);
        this._suiteNames = suiteNames;
    }

    public * getSuites() {
        if (this._suiteNames.length === 0) {
            this._suiteNames = fs.readdirSync(this._testRoot);
        }

        for (const item of this._suiteNames) {
            const fullPath = path.join(this._testRoot, item);
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory() && fs.existsSync(path.join(fullPath, "testcfg.py"))) {
                yield this.createTestSuite(item, fullPath);
            }
        }
    }

    private createTestSuite(suiteName: string, suitePath: string) {
        switch (suiteName) {
            case "known_issues":
                return new KnownIssuesTestSuite(suiteName, suitePath);

            default:
                return new TestSuite(suiteName, suitePath);
        }
    }
}

export default TestFinder;
