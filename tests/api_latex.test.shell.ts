import api from "../src/modules/api";
import chai from "chai";
import { describe } from "mocha";


describe("api latex [shell]", () => {
    it("create svg", async () => {
        const latexString = "\\begin{tikzpicture}\n"
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
        + "\\end{tikzpicture}";
        const svgOutput = await api.latex.createSvg({
            headerIncludes: [],
            latexString
        });
        chai.expect(svgOutput.pdfData.length).to.be.above(0, "Pdf not empty");
        chai.expect(svgOutput.svgData).to.be.a("string");
        chai.expect(svgOutput.svgData.length).to.be.above(0, "Pdf not empty");
        chai.expect(svgOutput.inkscapeStderr).to.be.a("string");
        chai.expect(svgOutput.inkscapeStdout).to.be.a("string");
        chai.expect(svgOutput.latexStderr).to.be.a("string");
        chai.expect(svgOutput.latexStdout).to.be.a("string");
        const svgOutputPoppler = await api.latex.createSvg({
            headerIncludes: [],
            latexString,
            usePoppler: true
        });
        chai.expect(svgOutputPoppler.pdfData.length).to.be.above(0, "Pdf not empty");
        chai.expect(svgOutputPoppler.svgData).to.be.a("string");
        chai.expect(svgOutputPoppler.svgData.length).to.be.above(0, "Pdf not empty");
        chai.expect(svgOutputPoppler.inkscapeStderr).to.be.a("string");
        chai.expect(svgOutputPoppler.inkscapeStdout).to.be.a("string");
        chai.expect(svgOutputPoppler.latexStderr).to.be.a("string");
        chai.expect(svgOutputPoppler.latexStdout).to.be.a("string");
    }).timeout(40000);
});
