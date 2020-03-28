import * as helper from "../helper";
import { debuglog } from "util";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";


const debug = debuglog("app-inkscape");


export interface InkscapePdf2SvgInputOptions {
    usePoppler?: boolean
}

export interface InkscapePdf2SvgInput {
    pdfData: Buffer
    pageNumber?: number
    inkscapeOptions?: InkscapePdf2SvgInputOptions
}

export interface InkscapePdf2Svg {
    stdout: string
    stderr: string
    svgData: string
}

export const pdf2Svg = async (input: InkscapePdf2SvgInput): Promise<InkscapePdf2Svg> => {
    debug("pdf2Svg");
    // Create working directory
    const workingDirName = path.join(os.tmpdir(), String(Date.now()));
    await fs.mkdir(workingDirName);
    // Create PDF file
    const temporaryPdf = path.join(workingDirName, "temp.pdf");
    await fs.writeFile(temporaryPdf, input.pdfData);
    const temporarySvg = path.join(workingDirName, "temp.svg");
    debug(`pdf2Svg temporaryPdf=${temporaryPdf}, temporarySvg=${temporarySvg}`);
    const inkscapeCommand = "inkscape";
    const inkscapeCommandOptions = [
        temporaryPdf,
        "--export-filename",
        temporarySvg,
        ... (input.inkscapeOptions !== undefined && input.inkscapeOptions.usePoppler ? ["--pdf-poppler"] : [  ]),
        "--pdf-page",
        input.pageNumber ? String(input.pageNumber) : "1"
    ];
    debug(`Run command: ${inkscapeCommand} ${inkscapeCommandOptions.join(" ")}`);
    const child = spawn(inkscapeCommand, inkscapeCommandOptions, { cwd: workingDirName });
    const bufferStdout: Buffer[] = [];
    const bufferStderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => { bufferStdout.push(chunk); });
    child.stderr.on("data", (chunk: Buffer) => { bufferStderr.push(chunk); });
    return new Promise((resolve, reject) => {
        child.on("close", code => {
            const stderr = bufferStderr.toString();
            if (code !== 0) {
                helper.fileSystem.rmDirRecursive(workingDirName);
                return reject(Error(`Child process exited with code ${code} (stderr=${stderr})`));
            }
            const stdout = bufferStdout.toString();
            fs.readFile(temporarySvg, { encoding: "utf8" }).then(svgData => {
                resolve({ stderr, stdout, svgData });
            }).catch(reject).then(() => helper.fileSystem.rmDirRecursive(workingDirName));
        });
    });
};
