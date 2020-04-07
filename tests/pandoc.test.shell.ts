import * as pandoc from "../src/modules/pandoc";
import chai from "chai";
import { describe } from "mocha";
import { promises as fs } from "fs";
import os from "os";
import path from "path";


// Show stack trace on error
chai.config.includeStack = true;

describe("pandoc [shell]", () => {
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
                data: "# It works\n\nTest $\\omega$\n",
                directories: ["blub"],
                filename: "a.md",
                sourceFile: true
            },
            {
                data: "# Really\n\nOMG\n$$\\mathbb{O} = \\dfrac{22 + 100}{\\infty}$$\n",
                directories: ["blab"],
                filename: "b.md",
                sourceFile: true
            }
        ];
        const pandocOptions: pandoc.PandocMd2PdfInputPandocOptions = {
            pandocArgs: {
                pdfEngine: "xelatex",
                toc: true,
                tocDepth: 3,
                variables: [{
                    name: "geometry",
                    value: [ { name: "a4paper" }, { name: "margin=2cm" } ]
                }]
            }
        };
        const outputDefault = await pandoc.md2Pdf({ files, pandocOptions });
        chai.expect(outputDefault.stdout).to.be.a("string");
        chai.expect(outputDefault.stderr).to.be.a("string");
        chai.expect(outputDefault.pdfFile).to.be.a("Uint8Array");
        chai.expect(outputDefault.pdfFile).to.not.equal(undefined);
        chai.expect(outputDefault.zipFile).to.equal(undefined);

        await fs.writeFile(path.join(os.tmpdir(), "out.pdf"), outputDefault.pdfFile);
        await fs.unlink(path.join(os.tmpdir(), "out.pdf"));


        const outputPdfOnly = await pandoc.md2Pdf({ files, mode: pandoc.PandocMd2PdfMode.PDF_ONLY, pandocOptions });
        chai.expect(outputPdfOnly.stdout).to.be.a("string");
        chai.expect(outputPdfOnly.stderr).to.be.a("string");
        chai.expect(outputPdfOnly.pdfFile).to.be.a("Uint8Array");
        chai.expect(outputPdfOnly.pdfFile).to.not.equal(undefined);
        chai.expect(outputPdfOnly.zipFile).to.equal(undefined);

        await fs.writeFile(path.join(os.tmpdir(), "out.pdf"), outputPdfOnly.pdfFile);
        await fs.unlink(path.join(os.tmpdir(), "out.pdf"));


        const outputWithZip = await pandoc.md2Pdf({ files, mode: pandoc.PandocMd2PdfMode.BOTH, pandocOptions });
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

    }).timeout(40000);
});
