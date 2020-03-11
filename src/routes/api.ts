import * as express from "express";
import { StartExpressServerOptions } from "../config/express";
import { debuglog } from "util";
import * as latex from "../modules/latex";
import * as inkscape from "../modules/inkscape";

const debug = debuglog("app-express-route-api");


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/latex2svg", async (req, res) => {
        // TODO: Cache SVGs
        debug(`Got: latexStringHash=${req.body.latexStringHash}, latexString=${req.body.latexString}, `
              + `latexHeaderIncludes=${req.body.latexHeaderIncludes}, `
              + `apiVersion=${req.body.apiVersion}`);
        const headerIncludes = req.body.latexHeaderIncludes as string[];
        const texData = "\\documentclass[tikz]{standalone}\n"
                          + headerIncludes.map(include => `${include}\n`)
                          + "\\begin{document}\n"
                          + req.body.latexString + "\n"
                          + "\\end{document}\n";
        try {
            const pdfData = await latex.tex2Pdf({ texData });
            const svgData = await inkscape.pdf2Svg(pdfData);
            res.status(200).json({
                svgData,
                id: req.body.latexStringHash
            });
        } catch(e) {
            res.status(500).json({
                error: e,
                id: req.body.latexStringHash
            });
        }
    });
};
