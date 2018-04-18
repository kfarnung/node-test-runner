import * as fs from "fs";
import * as path from "path";
import StatusFile from "./StatusFile";
import TestCase from "./TestCase";

class TestSuites {
    private readonly suiteName: string;
    private readonly suitePath: string;
    private readonly statusFile: StatusFile;

    constructor(suitePath: string) {
        this.suiteName = path.basename(suitePath);
        this.suitePath = path.resolve(suitePath);
        this.statusFile = new StatusFile(path.join(this.suitePath, this.suiteName + ".status"));
    }

    get name() {
        return this.suiteName;
    }

    public * getTests() {
        const testPattern = /^(test-.+)\.m?js$/;
        for (const item of fs.readdirSync(this.suitePath)) {
            const testMatch = testPattern.exec(item);
            if (testMatch !== null) {
                const name = testMatch[1];

                if (!this.statusFile.isSkipped(name)) {
                    yield new TestCase(
                        `${this.suiteName}/${name}`,
                        path.join(this.suitePath, item),
                        this.statusFile.isFlaky(name));
                }
            }
        }
    }

    public isFlaky(name: string) {
        return this.statusFile.isFlaky(name);
    }
}

export default TestSuites;
