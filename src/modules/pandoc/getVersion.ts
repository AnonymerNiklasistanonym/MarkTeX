import { spawn } from "child_process";

export interface PandocVersion {
    fullText: string
    major: number
    minor: number
    patch: number
}

/**
 * Regex to get the pandoc version via command line arguments.
 * @example "pandoc 2.9.2"
 * "Compiled with pandoc-types 1.20..."
 * [1] = "major" = 2
 * [2] = "minor" = 9
 * [3] = "patch" = 2
 */
const regexPandocVersion = /^pandoc ([0-9]+?)\.([0-9]+?)\.([0-9]+?)/g;

/**
 * Get pandoc version from command line string output.
 * @param versionString Command line output of `pandoc --version`
 */
const getVersionFromString = (versionString: string): PandocVersion | undefined => {
    for (const match of versionString.matchAll(regexPandocVersion)) {
        return {
            fullText: versionString,
            major: Number(match[1]),
            minor: Number(match[2]),
            patch: Number(match[3])
        };
    }
    return undefined;
};

export const getVersion = async (): Promise<PandocVersion> => {
    const child = spawn("pandoc", ["--version"]);
    const bufferStdout: Buffer[] = [];
    const bufferStderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => { bufferStdout.push(chunk); });
    child.stderr.on("data", (chunk: Buffer) => { bufferStderr.push(chunk); });
    return new Promise((resolve, reject) => {
        child.on("close", code => {
            if (code !== 0) {
                reject(Error(`Child process exited with code ${code} (stderr=${bufferStderr.toString()})`));
            }
            const versionString = bufferStdout.toString();
            const versionInfo = getVersionFromString(versionString);
            if (versionInfo) {
                resolve(versionInfo);
            } else {
                reject(Error(`Parse error: Output did not contain the version. (stdout=${versionString})`));
            }
        });
    });
};
