import * as express from "express";
import { StartExpressServerOptions } from "../../config/express";
import { debuglog } from "util";
import * as api from "../../modules/api";
import * as expressValidator from "express-validator";
import { validateWithTerminationOnError } from "../../middleware/expressValidator";
import * as latexRequestCache from "../../modules/latexRequestCache";
import type * as types from "./latex2svgTypes";
export type { types };


const debug = debuglog("app-express-route-api");


let latestRequestDate = "";

const sleep = async (millisec: number): Promise<void> => new Promise(resolve => setTimeout(resolve, millisec));


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/latex2svg",
        validateWithTerminationOnError(expressValidator.checkSchema({
            latexStringHash: {
                errorMessage: "Not a string",
                isString: true
            },
            latexString: {
                errorMessage: "Not a string",
                isString: true
            },
            timeOfRequest: {
                errorMessage: "Not a string",
                isString: true
            },
            latexHeaderIncludes: {
                errorMessage: "Not a string",
                isArray: true,
                custom: {
                    options: (latexHeaderIncludes: any[]): boolean => {
                        for (const latexHeaderInclude of latexHeaderIncludes) {
                            if (typeof latexHeaderInclude !== "string") {
                                throw new Error("Latex header includes are not a string array");
                            }
                        }
                        return true;
                    }
                }
            },
            apiVersion: {
                isInt: true,
                custom: {
                    options: (apiVersion: number): boolean => {
                        if (apiVersion === 1) {
                            return true;
                        }
                        throw new Error("API version is not supported");
                    }
                }
            }
        })),
        async (req, res) => {
            const input = req.body as types.Latex2SvgRequestApi;
            debug(`Got: latexStringHash=${input.latexStringHash}, apiVersion=${input.apiVersion}`);
            // Check first if the version was already converted
            const id = input.latexStringHash;
            const cachedSvgData = latexRequestCache.get(id);
            if (cachedSvgData) {
                return res.status(200).json({ svgData: cachedSvgData.svgData, id });
            }
            // If not cached wait some time to not kill the server with requests and check if there are
            // immediately new requests
            latestRequestDate = input.timeOfRequest;
            await sleep(500);
            // If there was no new document time continue, otherwise kill request
            if (latestRequestDate !== input.timeOfRequest) {
                debug(`latex2svg: A later request (${latestRequestDate}) was found so the current request`
                  + `(${input.timeOfRequest}) was discarded`);
                return res.status(200).json({
                    svgData: "<svg></svg>",
                    id: input.latexStringHash
                });
            }
            // If not try to convert it
            try {
                debug("latex2svg: Start rendering of tex to svg");
                const latex2SvgOut = await api.latex.latex2Svg({
                    headerIncludes: input.latexHeaderIncludes,
                    latexString: input.latexString
                });
                debug("latex2svg: Render of tex to pdf complete");
                // Add it to the cache
                latexRequestCache.add(id, { svgData: latex2SvgOut.svgData });
                const response: types.Latex2SvgResponse = {
                    svgData: latex2SvgOut.svgData,
                    id: input.latexStringHash
                };
                return res.status(200).json(response);
            } catch (err) {
                debug(`latex2svg: Error when converting tex to pdf: ${err}`);
                return res.status(500).json({
                    error: err,
                    id: input.latexStringHash
                });
            }
        });
};
