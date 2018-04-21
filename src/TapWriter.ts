import * as fs from "fs";
import * as os from "os";
import { ITestResult } from "./TestCase";

class TapWriter {
    private readonly _consoleEcho: boolean;
    private readonly _writeStream: fs.WriteStream;
    private _testCount: number = 0;

    constructor(filePath: string, consoleEcho: boolean = false) {
        this._writeStream = fs.createWriteStream(filePath, "utf8");
        this._writeStream.write(`TAP version 13${os.EOL}`);

        this._consoleEcho = consoleEcho;
    }

    public writeResult(result: ITestResult) {
        const outputLines: string[] = [];

        let topLine = `${result.success ? "ok" : "not ok"} ${++this._testCount} ${result.name}`;
        if (!result.success && result.flaky) {
            topLine += " # TODO : Fix flaky test";
        }
        outputLines.push(topLine);

        outputLines.push("  ---");
        outputLines.push(`  duration_ms: ${Math.round(result.duration) / 1000}`);

        if (!result.success) {
            outputLines.push("  severity: fail");
            outputLines.push(`  exitcode: ${result.exitCode}`);
            outputLines.push("  stack: |-");

            const lines = result.output.split(/\r?\n/);
            for (const line of lines) {
                outputLines.push(`    ${line}`);
            }
        }

        outputLines.push("  ...");

        const outputStr = outputLines.join(os.EOL);

        this._writeStream.write(outputStr);
        this._writeStream.write(os.EOL);

        if (this._consoleEcho) {
            console.log(outputStr);
        }
    }
}

export default TapWriter;
