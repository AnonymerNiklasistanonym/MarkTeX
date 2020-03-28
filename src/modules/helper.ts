/* eslint-disable no-console */
import { createWriteStream, promises as fs } from "fs";
import archiver from "archiver";
import { debuglog } from "util";
import path from "path";


const debug = debuglog("app-helper");


export const rmDirRecursive = async (dirPath: string): Promise<void> => {
    debug(`Remove directory recursively: '${dirPath}'`);
    try {
        // Check if this file even exists
        await fs.access(dirPath);
        // Delete each file in the directory
        for (const file of await fs.readdir(dirPath)) {
            const dirFilePath = path.join(dirPath, file);
            try {
                // Check if file is directory or file and then remove it according to this
                const statResult = await fs.lstat(dirFilePath);
                if (statResult.isDirectory()) {
                    await rmDirRecursive(dirFilePath);
                } else {
                    await fs.unlink(dirFilePath);
                }
            } catch (err) {
                // ignore error
            }
        }
        // Remove original directory after all its contents were removed
        await fs.rmdir(dirPath);
    } catch (err) {
        // ignore error
    }
};

/** lol */
export interface ZipFileFilesFile {
    filePath: string
    zipFileName?: string
}

export interface ZipFileFilesDirectory {
    dirPath: string
    zipDirName?: string
}

export interface ZipFileFiles {
    files?: ZipFileFilesFile[]
    directories?: ZipFileFilesDirectory[]
}

export const createZipFile = async (source: ZipFileFiles, out: string): Promise<void> => {
    debug(`Create zip file ${JSON.stringify(source)}`);
    const archive = archiver.create("zip", { zlib: { level: 9 } });
    const stream = createWriteStream(out);

    return new Promise((resolve, reject) => {
        archive
            .on("error", err => reject(err))
            .pipe(stream);
        if (source.files) {
            for (const file of source.files) {
                archive.file(file.filePath, { name: file.zipFileName ? file.zipFileName : file.filePath });
            }
        }
        if (source.directories) {
            for (const directory of source.directories) {
                archive.directory(directory.dirPath, directory.zipDirName ? directory.zipDirName : false);
            }
        }
        stream.on("close", () => resolve());
        archive.finalize();
    });
};
