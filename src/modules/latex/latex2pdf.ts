import * as helper from "../helper";
import crypto from "crypto";
import { debuglog } from "util";
import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";

const debug = debuglog("app-latex");


export interface Tex2PdfInputOptions {
    /**
     * Escape shell symbols.
     *
     * @example "-shell-escape"
     */
    shellEscape?: boolean
    /**
     * Disable interaction and just fail on error.
     *
     * @example "-interaction=nonstopmode"
     */
    interactionNonstop?: boolean
}

export interface Tex2PdfInput {
    texData: string
    latexOptions?: Tex2PdfInputOptions
}

export interface Tex2Pdf {
    stdout: string
    stderr: string
    pdfData: Buffer
}

export const tex2Pdf = async (input: Tex2PdfInput): Promise<Tex2Pdf> => {
    debug(`tex2Pdf texData=${input.texData}`);
    // Create working directory
    const workingDirName = `${Date.now()}${crypto.createHash("md5").update(input.texData).digest("hex")}`;
    await fs.mkdir(workingDirName);
    // Create PDF file
    const temporaryTexName = "temp.tex";
    const temporaryTex = path.join(workingDirName, temporaryTexName);
    await fs.writeFile(temporaryTex, input.texData);
    const temporaryPdfName = "temp.pdf";
    const temporaryPdf = path.join(workingDirName, temporaryPdfName);
    debug(`tex2Pdf temporaryTex=${temporaryTex}, temporaryPdf=${temporaryPdf}`);
    // TODO: Log command
    const child = spawn("xelatex", [
        `-jobname=${temporaryPdfName.slice(0, temporaryPdfName.length - 4)}`,
        ... (input.latexOptions !== undefined && input.latexOptions.shellEscape
            ? ["-shell-escape"] : []),
        ... (input.latexOptions !== undefined && input.latexOptions.interactionNonstop
            ? ["-interaction=nonstopmode"] : []),
        temporaryTexName
    ], { cwd: workingDirName });
    const bufferStdout: Buffer[] = [];
    const bufferStderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => { bufferStdout.push(chunk); });
    child.stderr.on("data", (chunk: Buffer) => { bufferStderr.push(chunk); });
    return new Promise((resolve, reject) => {
        child.on("close", async (code) => {
            debug(`tex2Pdf finished out='${temporaryPdf}'`);
            const stderr = bufferStderr.toString();
            const stdout = bufferStdout.toString();
            if (code !== 0) {
                await helper.fileSystem.rmDirRecursive(workingDirName);
                return reject(Error(`Child process exited with code ${code} (stderr=${stderr},`
                                    + `stdout=${stdout})`));
            }

            try {
                const pdfData = await fs.readFile(temporaryPdf);
                await helper.fileSystem.rmDirRecursive(workingDirName);
                resolve({ pdfData, stderr, stdout });
            } catch (error) {
                await helper.fileSystem.rmDirRecursive(workingDirName);
                return reject(error);
            }
        });
    });
};
