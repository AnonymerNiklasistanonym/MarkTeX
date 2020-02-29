import { spawn } from "child_process";

export interface PandocVersion {
    fullText: string
    versionMajor: number
    versionMinor: number
}

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
            for (const match of versionString.matchAll(/pandoc (.*?)\.(.*?)/g)) {
                return resolve({
                    fullText: versionString,
                    versionMajor: Number(match[1]),
                    versionMinor: Number(match[2])
                });
            }
            reject(Error(`Parse error: Output did not contain the version. (stdout=${versionString})`));
        });
    });
};
