import * as chai from "chai";
import { describe } from "mocha";
import * as pandoc from "../src/shell/pandoc";
import { promises as fs } from "fs";

describe("pandoc api", () => {
    it("version", async () => {
        const version = await pandoc.getVersion();
        chai.expect(version.output).to.be.a("string");
        chai.assert(version.output.length > 0);
        chai.expect(version.versionMajor).to.be.a("number");
        chai.expect(version.versionMajor % 1).to.equal(0);
        chai.expect(version.versionMinor).to.be.a("number");
        chai.expect(version.versionMinor % 1).to.equal(0);
    });

    it("convert md to pdf", async () => {
        const inputFiles: pandoc.PandocInputFile[] = [
            {
                filename: "a.md",
                directories: ["blub"],
                data: "# It works\n\nTest $\omega$\n",
                sourceFile: true
            },
            {
                filename: "b.md",
                directories: ["blab"],
                data: "# Really\n\nOMG\n$$a \mathb$$\n",
                sourceFile: true
            }
        ];
        const command: pandoc.PandocInputCommandMd2Latex = {
            pdfFileName: "out.pdf",
            pandocArgs: [
                {
                    name: "PAGE_SIZE",
                    args: pandoc.PandocInputCommandMd2LatexDefaultArgs.pageSize
                }, {
                    name: "TABLE_OF_CONTENTS",
                    args: pandoc.PandocInputCommandMd2LatexDefaultArgs.tableOfContents
                }, {
                    name: "LATEX_PDF_ENGINE",
                    args: pandoc.PandocInputCommandMd2LatexDefaultArgs.pdfEngine
                }
            ]
        };
        const output = await pandoc.convertMd2Latex(inputFiles, command);
        chai.expect(output.output).to.be.a("string");
        chai.expect(output.pdfFile).to.be.a("Uint8Array");
        chai.expect(output.zipFile).to.be.a("Uint8Array");

        await fs.writeFile("out.pdf", output.pdfFile);
        await fs.unlink("out.pdf");
        await fs.writeFile("out.zip", output.zipFile);
        await fs.unlink("out.zip");

        const outputFast = await pandoc.convertMd2Latex(inputFiles, command, { fast: true });
        chai.expect(outputFast.output).to.be.a("string");
        chai.expect(outputFast.pdfFile).to.be.a("Uint8Array");

        await fs.writeFile("out_fast.pdf", outputFast.pdfFile);
        await fs.unlink("out_fast.pdf");

    }).timeout(20000);
});
