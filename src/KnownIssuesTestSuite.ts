import TestSuite from "./TestSuite";

class KnownIssuesTestSuite extends TestSuite {
    constructor(suiteName: string, suitePath: string) {
        super(suiteName, suitePath);
    }

    protected createTestCase(name: string, fileName: string) {
        const testCase = super.createTestCase(name, fileName);
        testCase.expectFail = true;

        return testCase;
    }
}

export default KnownIssuesTestSuite;
