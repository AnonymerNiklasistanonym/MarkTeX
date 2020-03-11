import { spawn } from "child_process";

export interface XelatexVersion {
    fullText: string
}

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
            return resolve({
                fullText: versionString
            });
        });
    });
};
