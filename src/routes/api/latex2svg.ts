import * as expressValidator from "express-validator";
import * as latexRequestCache from "../../modules/latexRequestCache";
import type * as types from "./latex2svgTypes";
import api from "../../modules/api";
import { debuglog } from "util";
import express from "express";
import helper from "../../modules/helper";
import { StartExpressServerOptions } from "../../config/express";
import { validateWithError } from "../../middleware/expressValidator";

export type { types };


/** Dev debug logger */
const debug = debuglog("app-express-route-api");


export default (app: express.Application, options: StartExpressServerOptions): void => {

    /** Saves the date of the latest request */
    let latestRequestDate = "";

    app.post("/api/latex2svg",
        validateWithError(expressValidator.checkSchema({
            apiVersion: {
                custom: {
                    options: (apiVersion: number): boolean => {
                        if (apiVersion === 1) {
                            return true;
                        }
                        throw new Error("API version is not supported");
                    }
                },
                isInt: true
            },
            latexHeaderIncludes: {
                custom: {
                    options: (latexHeaderIncludes: any[]): boolean => {
                        for (const latexHeaderInclude of latexHeaderIncludes) {
                            if (typeof latexHeaderInclude !== "string") {
                                throw new Error("Latex header includes are not a string array");
                            }
                        }
                        return true;
                    }
                },
                errorMessage: "Not a string",
                isArray: true
            },
            latexString: {
                errorMessage: "Not a string",
                isString: true
            },
            latexStringHash: {
                errorMessage: "Not a string",
                isString: true
            },
            timeOfRequest: {
                errorMessage: "Not a string",
                isString: true
            },
            usePoppler: { isBoolean: true, optional: true }
        }), { sendJsonError: true }),
        async (req, res) => {
            const input = req.body as types.Latex2SvgRequestApi;
            debug(`Got: latexStringHash=${input.latexStringHash}, apiVersion=${input.apiVersion}`);
            // Check first if the version was already converted
            const id = input.latexStringHash;
            const cachedSvgData = latexRequestCache.get(id);
            if (cachedSvgData) {
                return res.status(200).json({ id, svgData: cachedSvgData.svgData });
            }
            // If not cached wait some time to not kill the server with requests and check if there are
            // immediately new requests
            latestRequestDate = input.timeOfRequest;
            await helper.time.sleep(500);
            // If there was no new document time continue, otherwise kill request
            if (latestRequestDate !== input.timeOfRequest) {
                debug(`latex2svg: A later request (${latestRequestDate}) was found so the current request`
                  + `(${input.timeOfRequest}) was discarded`);
                return res.status(200).json({
                    id: input.latexStringHash,
                    svgData: "<svg></svg>"
                });
            }
            // If not try to convert it
            try {
                debug("latex2svg: Start rendering of tex to svg");
                const latex2SvgOut = await api.latex.createSvg({
                    headerIncludes: input.latexHeaderIncludes,
                    latexString: input.latexString,
                    usePoppler: input.usePoppler
                });
                debug("latex2svg: Render of tex to pdf complete");
                // Add it to the cache
                latexRequestCache.add(id, { pdfData: latex2SvgOut.pdfData, svgData: latex2SvgOut.svgData });
                const response: types.Latex2SvgResponse = {
                    id: input.latexStringHash,
                    svgData: latex2SvgOut.svgData
                };
                return res.status(200).json(response);
            } catch (err) {
                debug(`latex2svg: Error when converting tex to pdf: ${JSON.stringify(err)}`);
                return res.status(500).json({
                    error: JSON.stringify(err),
                    id: input.latexStringHash
                });
            }
        });
};
