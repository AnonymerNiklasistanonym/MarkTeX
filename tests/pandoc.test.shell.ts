import chai from "chai";
import { describe } from "mocha";
import * as pandoc from "../src/modules/pandoc";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

// Show stack trace on error
chai.config.includeStack = true;

describe("pandoc api [shell]", () => {
    it("version", async () => {
        const version = await pandoc.getVersion();
        chai.expect(version.fullText).to.be.a("string");
        chai.expect(version.fullText.length).to.be.greaterThan(0);
        chai.expect(version.major).to.be.a("number");
        chai.expect(version.major).to.satisfy(Number.isInteger);
        chai.expect(version.minor).to.be.a("number");
        chai.expect(version.minor).to.satisfy(Number.isInteger);
        chai.expect(version.patch).to.be.a("number");
        chai.expect(version.patch).to.satisfy(Number.isInteger);
    });
    it("convert md to pdf", async () => {
        const files: pandoc.PandocMd2PdfInputFile[] = [
            {
                filename: "a.md",
                directories: ["blub"],
                data: "# It works\n\nTest $\\omega$\n",
                sourceFile: true
            },
            {
                filename: "b.md",
                directories: ["blab"],
                data: "# Really\n\nOMG\n$$\\mathbb{O} = \\dfrac{22 + 100}{\\infty}$$\n",
                sourceFile: true
            }
        ];
        const pandocOptions: pandoc.PandocMd2PdfInputPandocOptions = {
            pandocArgs: {
                variables: [{
                    name: "geometry",
                    value: [ { name: "a4paper" }, { name: "margin=2cm" } ]
                }],
                toc: true,
                tocDepth: 3,
                pdfEngine: "xelatex"
            }
        };
        try {
            const output = await pandoc.md2Pdf({ files, pandocOptions });
            chai.expect(output.stdout).to.be.a("string");
            chai.expect(output.stderr).to.be.a("string");
            chai.expect(output.pdfFile).to.be.a("Uint8Array");
            chai.expect(output.pdfFile).to.not.equal(undefined);
            chai.expect(output.zipFile).to.equal(undefined);

            await fs.writeFile(path.join(os.tmpdir(), "out.pdf"), output.pdfFile);
            await fs.unlink(path.join(os.tmpdir(), "out.pdf"));
        } catch (e) {
            chai.assert(false, e);
        }

        try {
            const outputWithZip = await pandoc.md2Pdf({ files, pandocOptions, options: { createSourceZipFile: true } });
            chai.expect(outputWithZip.stdout).to.be.a("string");
            chai.expect(outputWithZip.stderr).to.be.a("string");
            chai.expect(outputWithZip.pdfFile).to.be.a("Uint8Array");
            chai.expect(outputWithZip.pdfFile).to.not.equal(undefined);
            chai.expect(outputWithZip.zipFile).to.be.a("Uint8Array");
            chai.expect(outputWithZip.zipFile).to.not.equal(undefined);

            await fs.writeFile(path.join(os.tmpdir(), "out_zip.pdf"), outputWithZip.pdfFile);
            await fs.unlink(path.join(os.tmpdir(), "out_zip.pdf"));
            await fs.writeFile(path.join(os.tmpdir(), "out_zip.zip"), outputWithZip.zipFile);
            await fs.unlink(path.join(os.tmpdir(), "out_zip.zip"));
        } catch (e) {
            chai.assert(false, e);
        }

    }).timeout(40000);
});
