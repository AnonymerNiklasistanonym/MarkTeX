import { spawn } from "child_process";

export interface InkscapeVersion {
    fullText: string
    major: number
    minor: number
    commit: string
    date: Date
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
            const regex = /^Inkscape (.*?)\.(.*?).*? ([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9])/g;
            for (const match of versionString.matchAll(regex)) {
                return resolve({
                    fullText: versionString,
                    major: Number(match[1]),
                    minor: Number(match[2]),
                    commit: match[3],
                    date: new Date(match[4])
                });
            }
            return reject(Error(`Parse error: Output did not contain the version. (stdout=${versionString})`));
        });
    });
};
