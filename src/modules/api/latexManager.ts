import * as inkscape from "../inkscape";
import * as latex from "../latex";


export interface CreateSvgInput {
    headerIncludes: string[]
    latexString: string
    usePoppler?: boolean
}

export interface CreateSvgOutput {
    inkscapeStdout: string
    inkscapeStderr: string
    latexStdout: string
    latexStderr: string
    svgData: string
    pdfData: Buffer
}

/**
 * Convert LaTeX source code to SVG image.
 *
 * @param input Input data
 * @returns SVG and PDF output
 */
export const createSvg = async (input: CreateSvgInput): Promise<CreateSvgOutput> => {
    const texData = "\\documentclass[tikz]{standalone}\n"
                    + input.headerIncludes.join("\n")
                    + "\\begin{document}\n"
                    + input.latexString + "\n"
                    + "\\end{document}\n";
    const tex2PdfOut = await latex.tex2Pdf({
        latexOptions: { interactionNonstop: true },
        texData
    });
    const pdf2SvgOut = await inkscape.pdf2Svg({
        inkscapeOptions: { usePoppler: input.usePoppler },
        pdfData: tex2PdfOut.pdfData
    });
    return {
        inkscapeStderr: pdf2SvgOut.stderr,
        inkscapeStdout: pdf2SvgOut.stdout,
        latexStderr: tex2PdfOut.stderr,
        latexStdout: tex2PdfOut.stdout,
        pdfData: tex2PdfOut.pdfData,
        svgData: pdf2SvgOut.svgData
    };
};
