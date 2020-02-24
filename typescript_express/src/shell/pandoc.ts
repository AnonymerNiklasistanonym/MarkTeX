import { spawn } from "child_process";
import { promises as fs, createWriteStream } from "fs";
import * as path from "path";
import { rmDirRecursive, createZipFile } from "./helper";

export interface PandocVersion {
    output: string
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
                    output: versionString,
                    versionMajor: Number(match[1]),
                    versionMinor: Number(match[2])
                });
            }
            reject(Error(`Parse error: Output did not contain the version. (stdout=${versionString})`));
        });
    });
};

export interface PandocInputFile {
    /** List of all relative directories in which the file can be found */
    directories?: string[]
    /** Name of the file */
    filename: string
    /** Data of the file which can be text or a binary buffer */
    data: string | Buffer
    /** Indicate if the file is binary */
    binary?: boolean
    /** Indicate if the file is a pandoc source file */
    sourceFile?: boolean
}

export interface PandocInputCommandMd2LatexArgGroup {
    name: string
    args: string[]
}

export interface PandocInputCommandMd2Latex {
    pandocArgs: PandocInputCommandMd2LatexArgGroup[]
    pdfFileName: string
}

export const PandocInputCommandMd2LatexDefaultArgs = {
    pageSize: ["-V", "geometry:a4paper", "-V", "geometry:margin=2cm"],
    tableOfContents: ["--table-of-contents", "--toc-depth=3"],
    pdfEngine: ["--pdf-engine=xelatex"]
};

export interface PandocOutputMd2Latex {
    output: string
    pdfFile: Buffer
    zipFile?: Buffer
}


export interface PandocInputOptionsMd2Latex {
    fast?: boolean
}

// eslint-disable-next-line complexity
export const convertMd2Latex = async (files: PandocInputFile[],
    command: PandocInputCommandMd2Latex,
    options?: PandocInputOptionsMd2Latex): Promise<PandocOutputMd2Latex> => {
    const fastExecution = options?.fast || false;
    // Create working directory
    const workingDirName = String(Date.now());
    await fs.mkdir(workingDirName);
    // Copy all files to working directory
    const pandocSourceFiles: string[] = [];
    const allSourceFiles: string[] = [];
    for (const file of files) {
        const directories = file.directories;
        let fileDirPath = workingDirName;
        let fileDirPathRelative = ".";
        // Create directory hierarchy in which the file is located
        if (directories) {
            fileDirPathRelative = path.join(...directories);
            for (const directory of directories) {
                fileDirPath = path.join(fileDirPath, directory);
                try {
                    await fs.access(fileDirPath);
                } catch (error) {
                    await fs.mkdir(fileDirPath);
                }
            }
        }
        // Directory in which file is located exists, create file
        await fs.writeFile(path.join(fileDirPath, file.filename), file.data);
        if (file.sourceFile) {
            pandocSourceFiles.push(path.join(fileDirPathRelative, file.filename));
        }
        if (!fastExecution) {
            allSourceFiles.push(path.join(fileDirPath, file.filename));
        }
    }
    if (!fastExecution) {
        // Create Makefile (only for reproduction)
        const makefileContent = [
            `OUTPUT_FILE = ${command.pdfFileName}\n`,
            `SOURCE_FILES = ${pandocSourceFiles.join(" ")}\n`,
            ...command.pandocArgs.reduce((args: string[], argGroup) => args.concat([
                `PANDOC_ARGS_${argGroup.name} = ${argGroup.args.join(" ")}`
            ]), []),
            `PANDOC_ARGS = ${command.pandocArgs.reduce((args: string[], argGroup) => args.concat([
                `$(PANDOC_ARGS_${argGroup.name})`
            ]), []).join(" ")}`,
            "PANDOC = pandoc\n",
            "DOCKER_IMAGE_NAME = local/build_pdf",
            "DOCKER_FILE = Dockerfile",
            "DOCKER_ARGS =",
            "DOCKER = docker\n",
            "all: pdf\n",
            "pdf: $(SOURCE_FILES)",
            "\t$(PANDOC) $(PANDOC_ARGS) --from markdown $(SOURCE_FILES) --to latex -o $(OUTPUT_FILE)\n",
            "docker_image:",
            "\tdocker build $(DOCKER_ARGS) -t $(DOCKER_IMAGE_NAME) -f $(DOCKER_FILE) .\n",
            "docker: docker_image",
            "\tdocker rm -f temp || true",
            "\tdocker run -ti --name temp $(DOCKER_IMAGE_NAME)",
            "\trm -f $(OUTPUT_FILE)",
            "\tdocker cp temp:/usr/src/$(OUTPUT_FILE) ./",
            "\tdocker rm -f temp\n",
            "view:",
            "\tif [ -x \"$$(command -v xdg-open)\" ]; then \\",
            "\t\txdg-open $(OUTPUT_FILE) >/dev/null 2>&1; \\",
            "\telse \\",
            "\t\tstart $(OUTPUT_FILE) >/dev/null 2>&1; \\",
            "\tfi\n"
        ];
        const makefilePath = path.join(workingDirName, "Makefile");
        await fs.writeFile(makefilePath, makefileContent.join("\n"));
        allSourceFiles.push(makefilePath);
        // Create Dockerfile (only for reproduction)
        const dockerfileContent = [
            "FROM pandoc/latex:2.9.2\n",
            "RUN apk add --update make\n",
            "WORKDIR /usr/src\n",
            "COPY ./ ./\n",
            "ENTRYPOINT [ \"make\" ]",
            "CMD [ \"pdf\" ]\n"
        ];
        const dockerfilePath = path.join(workingDirName, "Dockerfile");
        await fs.writeFile(dockerfilePath, dockerfileContent.join("\n"));
        allSourceFiles.push(dockerfilePath);
    }
    // Run command
    const pdfOutFilePath = path.join(workingDirName, command.pdfFileName);
    const child = spawn("pandoc", [
        ...command.pandocArgs.reduce((args: string[], argGroup) => args.concat(argGroup.args), []),
        "--from", "markdown", ...pandocSourceFiles.map(file => path.join(workingDirName, file)),
        "--to", "latex", "-o", pdfOutFilePath
    ]);
    const bufferStdout: Buffer[] = [];
    const bufferStderr: Buffer[] = [];
    // use child.stdout.setEncoding('utf8'); if you want text chunks
    child.stdout.on("data", (chunk: Buffer) => {
        // eslint-disable-next-line no-console
        bufferStdout.push(chunk);
        // data from the standard output is here as buffers
    });
    child.stderr.on("data", (chunk: Buffer) => {
        // eslint-disable-next-line no-console
        bufferStderr.push(chunk);
        // data from the standard output is here as buffers
    });
    return new Promise((resolve, reject) => {
        child.on("close", (code) => {
            if (code === 0) {
                const stdout = bufferStdout.toString();
                if (!fastExecution) {
                    const zipOutFilePath = path.join(workingDirName, `${workingDirName}.zip`);
                    createZipFile({
                        files: allSourceFiles
                    }, zipOutFilePath).then(() => Promise.all([
                        fs.readFile(pdfOutFilePath),
                        fs.readFile(zipOutFilePath)
                    ])).then(data => {
                        resolve({
                            output: stdout,
                            pdfFile: data[0],
                            zipFile: data[1]
                        });
                        // Remove working directory
                        rmDirRecursive(workingDirName);
                    }).catch(err => {
                        reject(err);
                        // Remove working directory
                        rmDirRecursive(workingDirName);
                    });
                } else {
                    Promise.all([
                        fs.readFile(pdfOutFilePath)
                    ]).then(data => {
                        resolve({
                            output: stdout,
                            pdfFile: data[0]
                        });
                        // Remove working directory
                        rmDirRecursive(workingDirName);
                    }).catch(err => {
                        reject(err);
                        // Remove working directory
                        rmDirRecursive(workingDirName);
                    });
                }
            } else {
                reject(`Child process exited with code ${code} (output=${bufferStderr.toString()})`);
                // Remove working directory
                rmDirRecursive(workingDirName);
            }
        });
    });
};
