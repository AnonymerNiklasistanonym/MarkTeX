import { spawn } from "child_process";
import { promises as fs } from "fs";
import * as path from "path";
import { rmDirRecursive } from "../helper";

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
        `--pdf-page=${input.pageNumber ? input.pageNumber : 1}`
    ]);
    const bufferStdout: Buffer[] = [];
    const bufferStderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => { bufferStdout.push(chunk); });
    child.stderr.on("data", (chunk: Buffer) => { bufferStderr.push(chunk); });
    return new Promise((resolve, reject) => {
        child.on("close", code => {
            const stderr = bufferStderr.toString();
            if (code !== 0) {
                rmDirRecursive(workingDirName);
                return reject(Error(`Child process exited with code ${code} (stderr=${stderr})`));
            }
            const stdout = bufferStdout.toString();
            fs.readFile(temporarySvg, { encoding: "utf8" }).then(svgData => {
                resolve({ stderr, stdout, svgData });
            }).catch(reject).then(() => rmDirRecursive(workingDirName));
        });
    });
};
