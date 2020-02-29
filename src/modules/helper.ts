/* eslint-disable no-console */
import { promises as fs, createWriteStream } from "fs";
import * as path from "path";
import * as archiver from "archiver";

export const rmDirRecursive = async (dirPath: string): Promise<void> => {
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
            } catch(err) {
                // ignore error
            }
        }
        // Remove original directory after all its contents were removed
        await fs.rmdir(dirPath);
    } catch(err) {
        // ignore error
    }
};

export interface ZipFileFiles {
    files?: string[]
    directories?: string[]
}

export const createZipFile = async (source: ZipFileFiles, out: string): Promise<void> => {
    const archive = archiver.create("zip", { zlib: { level: 9 }});
    const stream = createWriteStream(out);

    return new Promise((resolve, reject) => {
        archive
            .on("error", err => reject(err))
            .pipe(stream);
        if (source.files) {
            for (const file of source.files) {
                archive.file(file, { name: file });
            }
        }
        if (source.directories) {
            for (const directory of source.directories) {
                archive.directory(directory, false);
            }
        }
        stream.on("close", () => resolve());
        archive.finalize();
    });
};
