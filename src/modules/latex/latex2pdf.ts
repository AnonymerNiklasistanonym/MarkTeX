import { spawn } from "child_process";
import { promises as fs } from "fs";
import * as path from "path";
import { rmDirRecursive } from "../helper";
import { debuglog } from "util";
const debug = debuglog("app-latex");

export interface Tex2PdfInputOptions {
    shellEscape?: boolean
}

export interface Tex2PdfInput {
    texData: string
    xelatexOptions?: Tex2PdfInputOptions
}

export interface Tex2Pdf {
    stdout: string
    stderr: string
    pdfData: Buffer
}

export const tex2Pdf = async (input: Tex2PdfInput): Promise<Tex2Pdf> => {
    debug(`tex2Pdf texData=${input.texData}`);
    // Create working directory
    const workingDirName = String(Date.now());
    await fs.mkdir(workingDirName);
    // Create PDF file
    const temporaryTex = path.join(workingDirName, "temp.tex");
    await fs.writeFile(temporaryTex, input.texData);
    const temporaryPdf = path.join(workingDirName, "temp.pdf");
    debug(`tex2Pdf temporaryTex=${temporaryTex}, temporaryPdf=${temporaryPdf}`);
    // TODO: Log command
    const child = spawn("xelatex", [
        temporaryTex,
        `-job-name=${temporaryPdf.slice(0, temporaryPdf.length - 4)}`
    ]);
    const bufferStdout: Buffer[] = [];
    const bufferStderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => { bufferStdout.push(chunk); });
    child.stderr.on("data", (chunk: Buffer) => { bufferStderr.push(chunk); });
    return new Promise((resolve, reject) => {
        child.on("close", code => {
            debug(`tex2Pdf finished out='${temporaryPdf}'`);
            const stderr = bufferStderr.toString();
            if (code !== 0) {
                rmDirRecursive(workingDirName);
                return reject(Error(`Child process exited with code ${code} (stderr=${stderr})`));
            }
            const stdout = bufferStdout.toString();
            fs.readFile(temporaryPdf).then(pdfData => {
                resolve({ stderr, stdout, pdfData });
            }).catch(reject).then(() => rmDirRecursive(workingDirName));
        });
    });
};
