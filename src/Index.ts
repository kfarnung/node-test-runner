import TapWriter from "./TapWriter";
import TestFinder from "./TestFinder";

if (process.argv.length < 3) {
    console.error(`usage: ${process.argv[0]} ${process.argv[1]} <test-root-dir> [test-suite] [test-suite]`);
    process.exit(1);
}

async function runTest(testDirectory: string, testSuites: string[]) {
    const finder = new TestFinder(testDirectory, testSuites);
    const writer = new TapWriter("test.tap", true);

    for (const suite of finder.getSuites()) {
        for (const testCase of suite.getTests()) {
            const result = await testCase.run();
            writer.writeResult(result);
        }
    }
}

runTest(process.argv[2], process.argv.slice(3));
