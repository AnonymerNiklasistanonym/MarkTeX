import * as express from "express";
import { StartExpressServerOptions } from "../../config/express";
import { debuglog } from "util";
import * as latex from "../../modules/latex";
import * as inkscape from "../../modules/inkscape";
import * as expressValidator from "express-validator";
import { validateWithTerminationOnError } from "../../middleware/expressValidator";
import * as latexRequestCache from "../../modules/latexRequestCache";


const debug = debuglog("app-express-route-api");


let latestRequestDate = "";

const sleep = async (millisec: number): Promise<void> => new Promise(resolve => setTimeout(resolve, millisec));

export interface ParamsDictionary {
    latexStringHash: string
    apiVersion: number
    timeOfRequest: string
    latexHeaderIncludes: string[]
    latexString: string
}

export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/latex2svg", validateWithTerminationOnError([
        expressValidator.check("latexStringHash").isString(),
        expressValidator.check("latexString").isString(),
        expressValidator.check("latexHeaderIncludes").isArray(),
        expressValidator.check("timeOfRequest").isString(),
        expressValidator.check("apiVersion").isInt(),
        expressValidator.check("apiVersion").custom((apiVersion: number): boolean => {
            if (apiVersion === 1) {
                return true;
            }
            throw new Error("API version is not supported");
        })
    // eslint-disable-next-line complexity
    ]), async (req: express.Request, res: express.Response) => {
        const input: ParamsDictionary = req.body;
        debug(`Got: latexStringHash=${input.latexStringHash}, apiVersion=${input.apiVersion}`);
        // Check first if the version was already converted
        const id = input.latexStringHash;
        const cachedSvgData = latexRequestCache.get(id);
        if (cachedSvgData) {
            return res.status(200).json({ svgData: cachedSvgData.svgData, id });
        }
        // If not cached wait some time to not kill the server with requests and check if there are
        // immediately new requests
        const currentRequestDate = input.timeOfRequest;
        latestRequestDate = currentRequestDate;
        await sleep(500);
        // If there was no new document time continue, otherwise kill request
        if (latestRequestDate !== input.timeOfRequest) {
            debug(`latex2svg: A later request (${latestRequestDate}) was found so the current request`
                  + `(${currentRequestDate}) was discarded`);
            return res.status(200).json({
                svgData: "<svg></svg>",
                id: input.latexStringHash
            });
        }

        // If not try to convert it
        const headerIncludes = input.latexHeaderIncludes;
        const texData = "\\documentclass[tikz]{standalone}\n"
                          + headerIncludes.join("\n")
                          + "\\begin{document}\n"
                          + input.latexString + "\n"
                          + "\\end{document}\n";
        debug(`latex2svg: Render tex to pdf (texData=${texData})`);
        try {
            const tex2PdfOut = await latex.tex2Pdf({
                texData,
                xelatexOptions: { interactionNonstop: true }
            });
            const pdf2SvgOut = await inkscape.pdf2Svg({
                pdfData: tex2PdfOut.pdfData,
                inkscapeOptions: { usePoppler: true }
            });
            debug("latex2svg: Render of tex to pdf complete");
            res.status(200).json({
                svgData: pdf2SvgOut.svgData,
                id: req.body.latexStringHash
            });
            // Add it to the cache
            latexRequestCache.add(id, { svgData: pdf2SvgOut.svgData });
        } catch(err) {
            debug(`latex2svg: Error when converting tex to pdf: ${err}`);
            res.status(500).json({
                error: err,
                id: req.body.latexStringHash
            });
        }
    });
};
