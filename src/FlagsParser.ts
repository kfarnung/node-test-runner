import * as fs from "fs";

class FlagsParser {
    public static parse(filePath: string) {
        if (!fs.existsSync(filePath)) {
            throw new Error("Invalid file path");
        }

        const stats = fs.statSync(filePath);
        if (!stats.isFile()) {
            throw new Error("Invalid file path");
        }

        const flags: string[] = [];
        const content = fs.readFileSync(filePath, "utf8");
        const regEx = /\/\/\s+Flags:(.*)/g;

        let match = null;
        // tslint:disable-next-line:no-conditional-assignment
        while ((match = regEx.exec(content)) !== null) {
            flags.push(...match[1].trim().split(" "));
        }

        return flags;
    }
}

export default FlagsParser;
