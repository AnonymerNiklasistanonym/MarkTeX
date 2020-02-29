import * as chai from "chai";
import { describe } from "mocha";
import * as pandoc from "../src/modules/pandoc";
import { promises as fs } from "fs";

describe("pandoc api [shell]", () => {
    it("version", async () => {
        const version = await pandoc.getVersion();
        chai.expect(version.fullText).to.be.a("string");
        chai.assert(version.fullText.length > 0);
        chai.expect(version.versionMajor).to.be.a("number");
        chai.expect(version.versionMajor % 1).to.equal(0);
        chai.expect(version.versionMinor).to.be.a("number");
        chai.expect(version.versionMinor % 1).to.equal(0);
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
                    value: [{ name: "a4paper" }, { name: "margin=2cm" }]
                }],
                toc: true,
                tocDepth: 3,
                pdfEngine: "xelatex"
            }
        };
        const output = await pandoc.md2Pdf({ files, pandocOptions });
        chai.expect(output.stdout).to.be.a("string");
        chai.expect(output.stderr).to.be.a("string");
        chai.expect(output.pdfFile).to.be.a("Uint8Array");
        chai.assert(output.pdfFile !== undefined);
        chai.assert(output.zipFile === undefined);

        await fs.writeFile("out.pdf", output.pdfFile);
        await fs.unlink("out.pdf");

        const outputWithZip = await pandoc.md2Pdf({ files, pandocOptions, options: { createSourceZipFile: true } });
        chai.expect(outputWithZip.stdout).to.be.a("string");
        chai.expect(outputWithZip.stderr).to.be.a("string");
        chai.expect(outputWithZip.pdfFile).to.be.a("Uint8Array");
        chai.assert(outputWithZip.pdfFile !== undefined);
        chai.expect(outputWithZip.zipFile).to.be.a("Uint8Array");
        chai.assert(outputWithZip.zipFile !== undefined);

        await fs.writeFile("out_zip.pdf", outputWithZip.pdfFile);
        await fs.unlink("out_zip.pdf");
        await fs.writeFile("out_zip.zip", outputWithZip.zipFile);
        await fs.unlink("out_zip.zip");

    }).timeout(20000);
});
