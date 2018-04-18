import * as fs from "fs";
import * as path from "path";
import TestSuite from "./TestSuite";

class TestFinder {
    private readonly testRoot: string;
    private suiteNames: string[];

    constructor(testRoot: string, suiteNames: string[] = []) {
        this.testRoot = path.resolve(testRoot);
        this.suiteNames = suiteNames;
    }

    public * getSuites() {
        if (this.suiteNames.length === 0) {
            this.suiteNames = fs.readdirSync(this.testRoot);
        }

        for (const item of this.suiteNames) {
            const fullPath = path.join(this.testRoot, item);
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory() && fs.existsSync(path.join(fullPath, "testcfg.py"))) {
                yield new TestSuite(fullPath);
            }
        }
    }
}

export default TestFinder;
