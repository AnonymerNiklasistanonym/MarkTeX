import { spawn } from "child_process";

export interface InkscapeVersion {
    output: string
    versionMajor: number
    versionMinor: number
    versionPatch: number
    versionCommit: string
    versionDate: Date
}

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
            const regex = /^Inkscape (.*?)\.(.*?)\.(.*?) (.*?), ([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9])/g;
            for (const match of versionString.matchAll(regex)) {
                return resolve({
                    output: versionString,
                    versionMajor: Number(match[1]),
                    versionMinor: Number(match[2]),
                    versionPatch: Number(match[3]),
                    versionCommit: match[4],
                    versionDate: new Date(match[5])
                });
            }
            return reject(Error(`Parse error: Output did not contain the version. (stdout=${versionString})`));
        });
    });
};
