import * as fs from "fs";
import * as path from "path";

class StatusFile {
    private static parseSection(condition: string) {
        if (condition === "true") {
            return true;
        }

        let match = null;
        let result: boolean = false;
        let logicalOperator: string = "";

        const conditionalPattern = /(\$[a-zA-Z0-9]+)(!=|==)([a-zA-Z0-9]+)(?:\s*(\|\||&&)\s*)?/g;

        // tslint:disable-next-line:no-conditional-assignment
        while ((match = conditionalPattern.exec(condition)) !== null) {
            const temp = this.evaluateSection(match[1], match[2], match[3]);

            switch (logicalOperator) {
                case "&&":
                    result = result && temp;
                    break;

                case "||":
                    result = result || temp;
                    break;

                default:
                    result = temp;
                    break;
            }

            logicalOperator = match[4];
        }

        return result;
    }

    private static evaluateSection(field: string, comparison: string, value: string) {
        let fieldValue = null;

        switch (field) {
            case "$arch":
                fieldValue = process.arch;
                break;

            case "$jsEngine":
                fieldValue = (process as any).jsEngine;
                break;

            case "$system":
                fieldValue = process.platform;
                break;

            default:
                throw new Error("Invalid field");
        }

        switch (comparison) {
            case "==":
                return fieldValue === value;

            case "!=":
                return fieldValue !== value;

            default:
                throw new Error("Invalid comparison");
        }
    }

    private readonly filePath: string;
    private prefix: string = "";
    private readonly statusMap: Map<string, string[]> = new Map();

    constructor(filePath: string) {
        this.filePath = filePath;
        this.parse();
    }

    get testPrefix() {
        return this.prefix;
    }

    public isSkipped(testName: string) {
        const name = path.basename(testName, path.extname(testName));
        const status = this.statusMap.get(name);
        if (status !== undefined) {
            return status.indexOf("SKIP") >= 0;
        }

        return false;
    }

    public isFlaky(testName: string) {
        const name = path.basename(testName, path.extname(testName));
        const status = this.statusMap.get(name);
        if (status !== undefined) {
            return status.indexOf("FLAKY") >= 0;
        }

        return false;
    }

    private parse() {
        if (!fs.existsSync(this.filePath)) {
            return;
        }

        const content = fs.readFileSync(this.filePath, "utf8");
        const lines = content.split(/\r?\n/);
        let processRules = false;

        const headerPattern = /\[([^\]]+)\]/;
        const prefixPattern = /^\s*prefix\s+([\w\_\.\-\/]+)$/;
        const rulePattern = /^\s*([^: ]*)\s*:(.*)/;

        for (const line of lines) {
            const headerMatch = headerPattern.exec(line);
            if (headerMatch !== null) {
                processRules = StatusFile.parseSection(headerMatch[1]);
                continue;
            }

            const ruleMatch = rulePattern.exec(line);
            if (ruleMatch !== null) {
                if (processRules) {
                    this.statusMap.set(ruleMatch[1], ruleMatch[2].trim().split(/, */));
                }

                continue;
            }

            const prefixMatch = prefixPattern.exec(line);
            if (prefixMatch !== null) {
                this.prefix = prefixMatch[1];
                continue;
            }
        }
    }
}

export default StatusFile;
