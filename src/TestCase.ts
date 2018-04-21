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
    private readonly _filePath: string;
    private readonly _name: string;
    private _duration: number = 0;
    private _exitCode: number = 1;
    private _expectFail: boolean = false;
    private _flaky: boolean = false;
    private _output: string = "";
    private _success: boolean = false;
    private _timeout: number = 0;

    constructor(name: string, filePath: string) {
        this._name = name;
        this._filePath = filePath;
    }

    get expectFail() {
        return this._expectFail;
    }

    set expectFail(value: boolean) {
        this._expectFail = value;
    }

    get flaky() {
        return this._flaky;
    }

    set flaky(value: boolean) {
        this._flaky = value;
    }

    get timeout() {
        return this._timeout;
    }

    set timeout(value: number) {
        this._timeout = value;
    }

    public async run() {
        const promise = new Promise((resolve, reject) => {
            this._duration = 0;
            this._exitCode = 1;
            this._output = "";
            this._success = false;

            const output: string[] = [];
            const start = performance.now();

            const flags = FlagsParser.parse(this._filePath);
            const testProcess = ChildProcess.execFile(
                process.execPath,
                [...flags, this._filePath],
                { timeout: this._timeout });
            testProcess.stdout.setEncoding("utf8");
            testProcess.stderr.setEncoding("utf8");

            testProcess.stdout.on("data", (chunk: string) => {
                output.push(chunk);
            });

            testProcess.stderr.on("data", (chunk: string) => {
                output.push(chunk);
            });

            testProcess.on("exit", (code: number) => {
                this._duration = performance.now() - start;
                this._exitCode = code;
                this._success = this._expectFail ? code !== 0 : code === 0;
                this._output = output.join("");

                resolve();
            });
        });

        await promise;

        return this.getResult();
    }

    public getResult(): ITestResult {
        return {
            duration: this._duration,
            exitCode: this._exitCode,
            flaky: this._flaky,
            name: this._name,
            output: this._output,
            success: this._success,
        };
    }
}

export default TestCase;
