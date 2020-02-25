import * as chai from "chai";
import { describe } from "mocha";
import * as inkscape from "../src/shell/inkscape";
import * as pandoc from "../src/shell/pandoc";
import { promises as fs } from "fs";

describe("inkscape <-> pandoc", () => {
    it("convert pdf to svg", async () => {
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
        const outputPdf = await pandoc.md2Pdf({ files, pandocOptions });
        const outputSvg = await inkscape.pdf2Svg({ pdfData: outputPdf.pdfFile });
        const outputSvgPoppler = await inkscape.pdf2Svg({
            pdfData: outputPdf.pdfFile,
            inkscapeOptions: { usePoppler: true }
        });

        chai.expect(outputSvg.stdout).to.be.a("string");
        chai.expect(outputSvg.svgData).to.be.a("string");
        chai.assert(outputSvg.svgData.length > 0);
        chai.expect(outputSvgPoppler.stdout).to.be.a("string");
        chai.expect(outputSvgPoppler.svgData).to.be.a("string");
        chai.assert(outputSvgPoppler.svgData.length > 0);

        await fs.writeFile("out_inkscape_pandoc.svg", outputSvg.svgData);
        await fs.writeFile("out_inkscape_pandoc_poppler.svg", outputSvgPoppler.svgData);
        await fs.writeFile("out_inkscape_pandoc.pdf", outputPdf.pdfFile);
        await fs.unlink("out_inkscape_pandoc.svg");
        await fs.unlink("out_inkscape_pandoc_poppler.svg");
        await fs.unlink("out_inkscape_pandoc.pdf");

    }).timeout(20000);
});
