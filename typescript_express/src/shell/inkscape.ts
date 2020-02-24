import { spawn } from "child_process";
import { promises as fs } from "fs";
import * as path from "path";
import { rmDirRecursive } from "./helper";

export interface InkscapeVersion {
    output: string
    versionMajor: number
    versionMinor: number
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
            const regex = /^Inkscape (.*?)\.(.*?).*? ([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9])/g;
            for (const match of versionString.matchAll(regex)) {
                return resolve({
                    output: versionString,
                    versionMajor: Number(match[1]),
                    versionMinor: Number(match[2]),
                    versionCommit: match[3],
                    versionDate: new Date(match[4])
                });
            }
            return reject(Error(`Parse error: Output did not contain the version. (stdout=${versionString})`));
        });
    });
};

export interface InkscapePdf2SvgInputOptions {
    usePoppler?: boolean
}

export interface InkscapePdf2SvgInput {
    pdfData: Buffer
    pageNumber?: number
    inkscapeOptions?: InkscapePdf2SvgInputOptions
}

export interface InkscapePdf2SvgOutput {
    stdout: string
    svgData: string
}

export const pdf2Svg = async (input: InkscapePdf2SvgInput): Promise<InkscapePdf2SvgOutput> => {
    // Create working directory
    const workingDirName = String(Date.now());
    await fs.mkdir(workingDirName);
    // Create PDF file
    const temporaryPdf = path.join(workingDirName, "temp.pdf");
    await fs.writeFile(temporaryPdf, input.pdfData);
    // await fs.unlink("out.pdf");
    const temporarySvg = path.join(workingDirName, "temp.svg");
    const child = spawn("inkscape", [
        temporaryPdf,
        `--export-filename=${temporarySvg}`,
        ...(input.inkscapeOptions !== undefined && input.inkscapeOptions.usePoppler ? ["--pdf-poppler"] : [  ]),
        // "--pdf-poppler",
        `--pdf-page=${input.pageNumber ? input.pageNumber : 1}`
    ]);
    const bufferStdout: Buffer[] = [];
    const bufferStderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => { bufferStdout.push(chunk); });
    child.stderr.on("data", (chunk: Buffer) => { bufferStderr.push(chunk); });
    return new Promise((resolve, reject) => {
        child.on("close", code => {
            if (code !== 0) {
                return reject(Error(`Child process exited with code ${code} (stderr=${bufferStderr.toString()})`));
            }
            fs.readFile(temporarySvg, { encoding: "utf8" }).then(data => {
                resolve({
                    stdout: bufferStdout.toString(),
                    svgData: data
                });
                // Remove working directory
                return rmDirRecursive(workingDirName);
            }).catch(err => {
                reject(err);
                // Remove working directory
                return rmDirRecursive(workingDirName);
            });
        });
    });
};
