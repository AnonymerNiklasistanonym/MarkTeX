import { spawn } from "child_process";

export interface InkscapeVersion {
    fullText: string
    major: number
    minor: number
    patch: string
    commit: string
    date: Date
}

/**
 * Regex to get the inkscape version via command line arguments.
 *
 * @example "Inkscape 1.2-dev (cf8c79727a, 2020-02-24)"
 * "  Pango version: 1.44.7"
 * [1] = "major" = 1
 * [2] = "minor" = 2
 * [3] = "patch" = "-dev"
 * [4] = "commit" = "cf8c79727a"
 * [5] = "iso date" = "2020-02-24"
 */
const regexInkscapeVersion = /^Inkscape ([0-9]+?)\.([0-9]+?)-?\.?(.*?) \((.*), ([0-9]{4}-[0-9]{2}-[0-9]{2})/g;

/**
 * Get inkscape version from command line string output.
 *
 * @param versionString Command line output of `inkscape --version`
 * @returns When parsing was successful version information, otherwise undefined
 */
const getVersionFromString = (versionString: string): InkscapeVersion | undefined => {
    for (const match of versionString.matchAll(regexInkscapeVersion)) {
        return {
            fullText: versionString,
            major: Number(match[1]),
            minor: Number(match[2]),
            patch: match[3],
            commit: match[4],
            date: new Date(match[5])
        };
    }
    return undefined;
};

export const getVersion = async (): Promise<InkscapeVersion> => {
    const child = spawn("inkscape", ["--version"]);
    const bufferStdout: Buffer[] = [];
    const bufferStderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => { bufferStdout.push(chunk); });
    child.stderr.on("data", (chunk: Buffer) => { bufferStderr.push(chunk); });
    return new Promise((resolve, reject) => {
        child.on("close", code => {
            if (code !== 0) {
                return reject(Error(`Child process exited with code ${code} (stderr=${bufferStderr.toString()})`));
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
