import ChildProcess from "child_process";
import { performance } from "perf_hooks";
import FlagsParser from "./FlagsParser";

export interface ITestResult {
    duration: number;
    exitCode: number;
    flaky: boolean;
    name: string;
    output: string;
    success: boolean;
}

class TestCase {
    private readonly name: string;
    private readonly filePath: string;
    private readonly flaky: boolean;
    private readonly timeout: number;
    private duration: number = 0;
    private exitCode: number = 1;
    private output: string = "";
    private success: boolean = false;

    constructor(name: string, filePath: string, flaky: boolean = false, timeout: number = 2 * 60 * 1000) {
        this.name = name;
        this.filePath = filePath;
        this.flaky = flaky;
        this.timeout = timeout;
    }

    public async run() {
        const promise = new Promise((resolve, reject) => {
            this.duration = 0;
            this.exitCode = 1;
            this.output = "";
            this.success = false;

            const output: string[] = [];
            const start = performance.now();

            const flags = FlagsParser.parse(this.filePath);
            const testProcess = ChildProcess.execFile(
                process.execPath,
                [...flags, this.filePath],
                { timeout: this.timeout });
            testProcess.stdout.setEncoding("utf8");
            testProcess.stderr.setEncoding("utf8");

            testProcess.stdout.on("data", (chunk: string) => {
                output.push(chunk);
            });

            testProcess.stderr.on("data", (chunk: string) => {
                output.push(chunk);
            });

            testProcess.on("exit", (code: number) => {
                this.duration = performance.now() - start;
                this.exitCode = code;
                this.success = (code === 0);
                this.output = output.join("");

                resolve();
            });
        });

        await promise;

        return this.getResult();
    }

    public getResult(): ITestResult {
        return {
            duration: this.duration,
            exitCode: this.exitCode,
            flaky: this.flaky,
            name: this.name,
            output: this.output,
            success: this.success,
        };
    }
}

export default TestCase;
