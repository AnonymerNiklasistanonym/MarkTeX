import { spawn } from "child_process";

export interface XelatexVersion {
    fullText: string
    engine: string
    major: number
    minor: number
}

/**
 * Regex to get the LaTeX version via command line arguments.
 * @example "XeTeX 3.14159265-2.6-0.999991 (TeX Live 2019/Arch Linux)"
 * "kpathsea version 6.3.1..."
 * [1] = "engine" = "XeTeX"
 * @example "MiKTeX-XeTeX 2.9.7338 (0.999992) (MiKTeX 2.9.7300 64-bit)"
 * "(C) 1994-2008 by SIL International..."
 * [1] = "engine" = "MiKTeX-XeTeX"
 */
const regexXelatexVersionEnginge = /^(.+?) ./g;

/**
 * Regex to get the LaTeX version via command line arguments.
 * @example "XeTeX 3.14159265-2.6-0.999991 (TeX Live 2019/Arch Linux)"
 * "kpathsea version 6.3.1..."
 * [1] = "engine" = "XeTeX"
 * [2] = "major" = 0
 * [3] = "minor" = 999991
 */
const regexXelatexVersion = /^(.+?) .*?-([0-9]+?)\.([0-9]+?) \(/g;

/**
 * Regex to get the LaTeX version via command line arguments.
 * @example "MiKTeX-XeTeX 2.9.7338 (0.999992) (MiKTeX 2.9.7300 64-bit)"
 * "(C) 1994-2008 by SIL International..."
 * [1] = "engine" = "MiKTeX-XeTeX"
 * [2] = "major" = 0
 * [3] = "minor" = 999992
 */
const regexXelatexVersionMikTex = /^(.+?) .*?\(([0-9]+?)\.([0-9]+?)\)/g;

/**
 * Get LaTeX version from command line string output.
 * @param versionString Command line output of `xelatex --version`
 */
const getVersionFromString = (versionString: string): XelatexVersion | undefined => {
    let engine;
    for (const match of versionString.matchAll(regexXelatexVersionEnginge)) {
        engine = match[1];
        break;
    }
    let versionRegex = regexXelatexVersion;
    if (engine === "MiKTeX-XeTeX") {
        versionRegex = regexXelatexVersionMikTex;
    }
    for (const match of versionString.matchAll(versionRegex)) {
        return {
            fullText: versionString,
            engine: match[1],
            major: Number(match[2]),
            minor: Number(match[3])
        };
    }
    return undefined;
};

export const getVersion = async (): Promise<XelatexVersion> => {
    const child = spawn("xelatex", ["--version"]);
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
