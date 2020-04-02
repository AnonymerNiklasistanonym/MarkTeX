import { existsSync, promises as fs } from "fs";
import chai from "chai";
import { describe } from "mocha";
import helper from "../src/modules/helper";
import os from "os";
import path from "path";


describe("helper api: time", () => {
    it("sleep", async () => {
        await helper.time.sleep(0);
        await helper.time.sleep(5);
    });
});

describe("helper api: file system", () => {
    const exampleDir = path.join(os.tmpdir(), "example");
    const exampleDirFile = path.join(exampleDir, "example_file");
    const exampleDirDir = path.join(exampleDir, "example_dir");
    const exampleDirDirFile = path.join(exampleDirDir, "example_file");

    it("rm dir recursive", async () => {
        await helper.fileSystem.rmDirRecursive(exampleDir);
        chai.expect(existsSync(exampleDir)).to.equal(false);

        await fs.mkdir(exampleDir);
        await fs.mkdir(exampleDirDir);
        await fs.writeFile(exampleDirFile, "test");
        await fs.writeFile(exampleDirDirFile, "test");
        chai.expect(existsSync(exampleDir)).to.equal(true);
        chai.expect(existsSync(exampleDirDir)).to.equal(true);

        await helper.fileSystem.rmDirRecursive(exampleDir);
        chai.expect(existsSync(exampleDir)).to.equal(false);

        await helper.fileSystem.rmDirRecursive(exampleDir);
        chai.expect(existsSync(exampleDir)).to.equal(false);
    });
    it("create zip file", async () => {
        await helper.fileSystem.rmDirRecursive(exampleDir);
        chai.expect(existsSync(exampleDir)).to.equal(false);

        await fs.mkdir(exampleDir);
        await fs.mkdir(exampleDirDir);
        await fs.writeFile(exampleDirFile, "test");
        await fs.writeFile(exampleDirDirFile, "test");
        chai.expect(existsSync(exampleDir)).to.equal(true);
        chai.expect(existsSync(exampleDirDir)).to.equal(true);

        const archiveOutputsDir = path.join(os.tmpdir(), "example_archives");
        await helper.fileSystem.rmDirRecursive(archiveOutputsDir);
        await fs.mkdir(archiveOutputsDir);

        const archiveOutputDirs = path.join(archiveOutputsDir, "example_archive_dirs.zip");
        await helper.fileSystem.createZipFile({ directories: [{ dirPath: exampleDir }] }, archiveOutputDirs);
        chai.expect(existsSync(archiveOutputDirs)).to.equal(true);

        const archiveOutputFiles = path.join(archiveOutputsDir, "example_archive_files.zip");
        await helper.fileSystem.createZipFile({
            files: [ { filePath: exampleDirFile }, { filePath: exampleDirDirFile } ]
        }, archiveOutputFiles);
        chai.expect(existsSync(archiveOutputFiles)).to.equal(true);

        const archiveOutputDirsBad = path.join(archiveOutputsDir, "example_archive_dirs_bad.zip");
        let throwsException1 = false;
        try {
            await helper.fileSystem.createZipFile({
                directories: [{ dirPath: exampleDirDir + "a" }]
            }, archiveOutputDirsBad);
        } catch (e) { throwsException1 = true; }
        chai.expect(throwsException1).to.equal(true);

        const archiveOutputFilesBad = path.join(archiveOutputsDir, "example_archive_files_bad.zip");
        let throwsException2 = false;
        try {
            await helper.fileSystem.createZipFile({
                files: [{ filePath: exampleDirDirFile + "a" }]
            }, archiveOutputFilesBad);
        } catch (e) { throwsException2 = true; }
        chai.expect(throwsException2).to.equal(true);

        await helper.fileSystem.rmDirRecursive(exampleDir);
        await helper.fileSystem.rmDirRecursive(archiveOutputsDir);
    }).timeout(200000);
});
