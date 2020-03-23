import * as latex from "../latex";
import * as inkscape from "../inkscape";

export interface LatexData2SvgDataInput {
    headerIncludes: string[]
    latexString: string
}

export const latex2Svg = async (input: LatexData2SvgDataInput): Promise<inkscape.InkscapePdf2Svg> => {
    const texData = "\\documentclass[tikz]{standalone}\n"
                    + input.headerIncludes.join("\n")
                    + "\\begin{document}\n"
                    + input.latexString + "\n"
                    + "\\end{document}\n";
    const tex2PdfOut = await latex.tex2Pdf({
        texData,
        xelatexOptions: { interactionNonstop: true }
    });
    const pdf2SvgOut = await inkscape.pdf2Svg({
        pdfData: tex2PdfOut.pdfData,
        inkscapeOptions: { usePoppler: true }
    });
    return pdf2SvgOut;
};
