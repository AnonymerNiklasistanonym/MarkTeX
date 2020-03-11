import * as chai from "chai";
import { describe } from "mocha";
import * as latex from "../src/modules/latex";
import { promises as fs } from "fs";

describe("latex api [shell]", () => {
    it("version", async () => {
        const version = await latex.getVersion();
        chai.expect(version.fullText).to.be.a("string");
        chai.assert(version.fullText.length > 0);
    });

    it("latex2pdf", async () => {
        const outputPdf = await latex.tex2Pdf({
            texData: "% A simple cycle\n"
            + "% Author : Jerome Tremblay\n"
            + "\\documentclass{article}\n"
            + "\\usepackage{tikz}\n"
            + "\\begin{document}\n"
            + "\\begin{tikzpicture}\n"
            + "\n"
            + "\\def \\n {5}\n"
            + "\\def \\radius {3cm}\n"
            + "\\def \\margin {8} % margin in angles, depends on the radius\n"
            + "\n"
            + "\\foreach \\s in {1,...,\\n}\n"
            + "{\n"
            + "  \\node[draw, circle] at ({360/\\n * (\\s - 1)}:\\radius) {$\\s$};\n"
            + "  \\draw[->, >=latex] ({360/\\n * (\\s - 1)+\\margin}:\\radius) \n"
            + "    arc ({360/\\n * (\\s - 1)+\\margin}:{360/\\n * (\\s)-\\margin}:\\radius);\n"
            + "}\n"
            + "\\end{tikzpicture}\n"
            + "\\end{document}\n"
        });
        chai.assert(outputPdf.pdfData !== undefined);
        await fs.writeFile("out_latex.pdf", outputPdf.pdfData);
        await fs.unlink("out_latex.pdf");
    });
});
