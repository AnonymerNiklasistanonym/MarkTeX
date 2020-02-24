import * as chai from "chai";
import { describe } from "mocha";
import * as inkscape from "../src/shell/inkscape";
import * as pandoc from "../src/shell/pandoc";
import { promises as fs } from "fs";

describe("inkscape <-> pandoc", () => {
    it("convert pdf to svg", async () => {
        const inputFiles: pandoc.PandocInputFile[] = [
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
        const output = await pandoc.convertMd2Latex(inputFiles, command, { fast: true });

        const inkscapeOptions: inkscape.InkscapePdf2SvgInputOptions = {
            usePoppler: true
        };
        const outputSvg = await inkscape.pdf2Svg({ pdfData: output.pdfFile });
        const outputSvgPoppler = await inkscape.pdf2Svg({ pdfData: output.pdfFile, inkscapeOptions });
        chai.expect(outputSvg.stdout).to.be.a("string");
        chai.expect(outputSvg.svgData).to.be.a("string");
        chai.assert(outputSvg.svgData.length > 0);
        chai.expect(outputSvgPoppler.stdout).to.be.a("string");
        chai.expect(outputSvgPoppler.svgData).to.be.a("string");
        chai.assert(outputSvgPoppler.svgData.length > 0);

        await fs.writeFile("out_inkscape_pandoc.svg", outputSvg.svgData);
        await fs.writeFile("out_inkscape_pandoc_poppler.svg", outputSvgPoppler.svgData);
        await fs.writeFile("out_inkscape_pandoc.pdf", output.pdfFile);
        await fs.unlink("out_inkscape_pandoc.svg");
        await fs.unlink("out_inkscape_pandoc_poppler.svg");
        await fs.unlink("out_inkscape_pandoc.pdf");

    }).timeout(20000);
});
