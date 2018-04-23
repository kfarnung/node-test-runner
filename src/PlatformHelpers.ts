class PlatformHelpers {
    public static getJsEngine() {
        const jsEngine = (process as any).jsEngine;
        return jsEngine || "v8";
    }
}

export default PlatformHelpers;
