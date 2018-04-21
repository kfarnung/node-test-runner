import * as fs from "fs";
import * as path from "path";
import StatusFile from "./StatusFile";
import TestCase from "./TestCase";

// Default timeout of 2 minutes
const DEFAULT_TIMEOUT = 2 * 60 * 1000;

class TestSuite {
    private readonly _statusFile: StatusFile;
    private readonly _suiteName: string;
    private readonly _suitePath: string;

    constructor(suiteName: string, suitePath: string) {
        this._suiteName = suiteName;
        this._suitePath = path.resolve(suitePath);
        this._statusFile = new StatusFile(path.join(this._suitePath, this._suiteName + ".status"));
    }

    get name() {
        return this._suiteName;
    }

    public * getTests() {
        const testPattern = /^(test-.+)\.m?js$/;
        for (const item of fs.readdirSync(this._suitePath)) {
            const testMatch = testPattern.exec(item);
            if (testMatch !== null) {
                const name = testMatch[1];

                if (!this._statusFile.isSkipped(name)) {
                    yield this.createTestCase(name, item);
                }
            }
        }
    }

    public isFlaky(name: string) {
        return this._statusFile.isFlaky(name);
    }

    protected createTestCase(name: string, fileName: string) {
        const testCase = new TestCase(`${this._suiteName}/${name}`, path.join(this._suitePath, fileName));
        testCase.flaky = this._statusFile.isFlaky(name);
        testCase.timeout = DEFAULT_TIMEOUT;

        return testCase;
    }
}

export default TestSuite;
