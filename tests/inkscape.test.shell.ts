import * as inkscape from "../src/modules/inkscape";
import * as pandoc from "../src/modules/pandoc";
import chai from "chai";
import { describe } from "mocha";
import { promises as fs } from "fs";


describe("inkscape [shell]", () => {
    it("version", async () => {
        const version = await inkscape.getVersion();
        chai.expect(version.fullText).to.be.a("string");
        chai.expect(version.fullText.length).to.be.greaterThan(0);
        chai.expect(version.commit).to.be.a("string");
        chai.expect(version.commit.length).to.be.greaterThan(0);
        chai.expect(version.date).to.be.a("Date");
        chai.expect(version.major).to.be.a("number");
        chai.expect(version.major).to.satisfy(Number.isInteger);
        chai.expect(version.minor).to.be.a("number");
        chai.expect(version.minor).to.satisfy(Number.isInteger);
        chai.expect(version.patch).to.be.a("string");
    });
    it("convert pdf to svg", async () => {
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
        const outputPdf = await pandoc.md2Pdf({ files, mode: pandoc.PandocMd2PdfMode.PDF_ONLY, pandocOptions });
        chai.expect(outputPdf.pdfFile).to.not.equal(undefined);
        if (outputPdf.pdfFile) {
            const outputSvg = await inkscape.pdf2Svg({ pdfData: outputPdf.pdfFile });
            const outputSvgPoppler = await inkscape.pdf2Svg({
                inkscapeOptions: { usePoppler: true },
                pdfData: outputPdf.pdfFile
            });

            chai.expect(outputSvg.stdout).to.be.a("string");
            chai.expect(outputSvg.svgData).to.be.a("string");
            chai.expect(outputSvg.svgData.length).to.be.above(0);
            chai.expect(outputSvgPoppler.stdout).to.be.a("string");
            chai.expect(outputSvgPoppler.svgData).to.be.a("string");
            chai.expect(outputSvgPoppler.svgData.length).to.be.above(0);

            await fs.writeFile("out_inkscape_pandoc.svg", outputSvg.svgData);
            await fs.writeFile("out_inkscape_pandoc_poppler.svg", outputSvgPoppler.svgData);
            await fs.writeFile("out_inkscape_pandoc.pdf", outputPdf.pdfFile);
            await fs.unlink("out_inkscape_pandoc.svg");
            await fs.unlink("out_inkscape_pandoc_poppler.svg");
            await fs.unlink("out_inkscape_pandoc.pdf");
        }

    }).timeout(40000);
});
