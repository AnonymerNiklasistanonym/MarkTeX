import * as docker from "../docker";
import * as helper from "../helper";
import * as make from "../make";
import { createPandocConfigFile, PandocConfigYmlInput } from "./pandocConfigYml";
import crypto from "crypto";
import { debuglog } from "util";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";


const debug = debuglog("app-pandoc");


export interface PandocMd2PdfInputFile {
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

export interface PandocMd2PdfInputPandocOptions {
    pandocArgs?: PandocConfigYmlInput
}

export interface PandocMd2PdfInputOptions {
    createSourceZipFile?: boolean
}

export interface PandocMd2PdfInput {
    files: PandocMd2PdfInputFile[]
    pandocOptions?: PandocMd2PdfInputPandocOptions
    options?: PandocMd2PdfInputOptions
}

export interface PandocMd2Pdf {
    stdout: string
    stderr: string
    pdfFile: Buffer
    zipFile?: Buffer
}

// TODO Latex beamer/document demo

// eslint-disable-next-line complexity
export const md2Pdf = async (input: PandocMd2PdfInput): Promise<PandocMd2Pdf> => {
    debug(`md2Pdf: ${JSON.stringify(input)}`);
    // TODO beamer example
    // TODO add options for author, date, title
    // TODO test images in all formats
    const createSourceZipFile = (input.options !== undefined && input.options.createSourceZipFile);
    // Create working directory
    const workingDirTimeStamp = String(
        Date.now() + crypto.createHash("md5").update(JSON.stringify(input)).digest("hex")
    );
    const workingDirName = path.join(os.tmpdir(), workingDirTimeStamp);
    await fs.mkdir(workingDirName);
    // Copy all files to working directory
    const pandocSourceFiles: string[] = [];
    const allSourceFiles: helper.fileSystem.ZipFileFilesFile[] = [];
    for (const file of input.files) {
        const directories = file.directories;
        let fileDirPath = workingDirName;
        let fileDirPathRelative = ".";
        // Create directory hierarchy in which the file is located
        if (directories) {
            fileDirPathRelative = path.join(... directories);
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
        if (createSourceZipFile) {
            allSourceFiles.push({
                filePath: path.join(fileDirPath, file.filename),
                zipFileName: path.join(fileDirPathRelative, file.filename)
            });
        }
    }
    const pandocArgs = (input.pandocOptions !== undefined && input.pandocOptions.pandocArgs !== undefined)
        ? input.pandocOptions.pandocArgs : {};
    pandocArgs.inputFiles = pandocSourceFiles;
    const pandocConfigContent = createPandocConfigFile(pandocArgs);
    debug(`pandoc.yml: input="${JSON.stringify(pandocArgs)}",output="${pandocConfigContent}"`);
    const pandocConfigName = "pandoc.yml";
    const pandocConfigPath = path.join(workingDirName, pandocConfigName);
    await fs.writeFile(pandocConfigPath, pandocConfigContent);
    allSourceFiles.push({ filePath: pandocConfigPath, zipFileName: pandocConfigName });
    if (createSourceZipFile) {
        // Create Makefile (only for reproduction)
        const makefileContent = make.createMakefile({
            definitions: [
                { name: "OUTPUT_FILE", value: "out.pdf" },
                {
                    name: "PANDOC_ARGS",
                    value: "--defaults pandoc.yml"
                },
                { name: "PANDOC", value: "pandoc" },
                {
                    name: "SOURCE_FILES",
                    value: pandocSourceFiles.join(" ")
                },
                { name: "DOCKER_IMAGE_NAME", value: "local/build_pdf" },
                { name: "DOCKER_FILE", value: "Dockerfile" },
                { name: "DOCKER", value: "docker" }
            ],
            jobs: [ {
                commands: ["$(PANDOC) $(PANDOC_ARGS) -o $(OUTPUT_FILE)"],
                default: true,
                dependencies: ["$(SOURCE_FILES)"],
                name: "pdf"
            },{
                commands: ["docker build $(DOCKER_ARGS) -t $(DOCKER_IMAGE_NAME) -f $(DOCKER_FILE) ."],
                name: "docker_image"
            },{
                commands: [
                    "docker rm -f temp || true",
                    "docker run -ti --name temp $(DOCKER_IMAGE_NAME)",
                    "rm -f $(OUTPUT_FILE)",
                    "docker cp temp:/usr/src/$(OUTPUT_FILE) ./",
                    "docker rm -f temp"
                ],
                dependencies: ["docker_image"],
                name: "docker"
            },{
                commands: [
                    "if [ -x \"$$(command -v xdg-open)\" ]; then \\",
                    "\txdg-open $(OUTPUT_FILE) >/dev/null 2>&1; \\",
                    "else \\",
                    "\tstart $(OUTPUT_FILE) >/dev/null 2>&1; \\",
                    "fi"
                ],
                name: "view_pdf"
            } ]
        });
        const makefileName = "Makefile";
        const makefilePath = path.join(workingDirName, makefileName);
        await fs.writeFile(makefilePath, makefileContent);
        allSourceFiles.push({ filePath: makefilePath, zipFileName: makefileName });
        // Create Dockerfile (only for reproduction)
        const dockerfileContent = docker.createDockerfile({
            cmd: ["pdf"],
            commands: [
                "RUN apk add --update make",
                "COPY ./ ./"
            ],
            entrypoint: ["make"],
            image: "pandoc/latex:2.9.2",
            workdir: "/usr/src"
        });
        const dockerfileName = "Dockerfile";
        const dockerfilePath = path.join(workingDirName, dockerfileName);
        await fs.writeFile(dockerfilePath, dockerfileContent);
        allSourceFiles.push({ filePath: dockerfilePath, zipFileName: dockerfileName });
    }
    // Run command
    const pdfOutFilePath = path.join(workingDirName, "out.pdf");
    const pandocCommand = "pandoc";
    const pandocCommandOptions = [
        "--defaults",
        pandocConfigPath,
        "-o",
        pdfOutFilePath
    ];
    debug(`Run command: ${pandocCommand} ${pandocCommandOptions.join(" ")}`);
    const child = spawn(pandocCommand, pandocCommandOptions, { cwd: workingDirName });
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
            debug(`Child process exited with ${code}`);
            const stderr = bufferStderr.toString();
            if (code !== 0) {
                helper.fileSystem.rmDirRecursive(workingDirName);
                return reject(Error(`Child process exited with code ${code} (stderr=${stderr})`));
            }
            const stdout = bufferStdout.toString();
            if (createSourceZipFile) {
                const zipOutFilePath = path.join(workingDirName, `${workingDirTimeStamp}.zip`);
                helper.fileSystem.createZipFile({
                    files: allSourceFiles
                }, zipOutFilePath).then(() => Promise.all([
                    fs.readFile(pdfOutFilePath),
                    fs.readFile(zipOutFilePath)
                ])).then(data => {
                    resolve({
                        pdfFile: data[0],
                        stderr,
                        stdout,
                        zipFile: data[1]
                    });
                }).catch(reject).then(() => helper.fileSystem.rmDirRecursive(workingDirName));
            } else {
                Promise.all([
                    fs.readFile(pdfOutFilePath)
                ]).then(data => {
                    resolve({
                        pdfFile: data[0],
                        stderr,
                        stdout
                    });
                }).catch(reject).then(() => helper.fileSystem.rmDirRecursive(workingDirName));
            }
        });
    });
};
