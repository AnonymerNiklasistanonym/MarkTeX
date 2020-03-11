import * as express from "express";
import { StartExpressServerOptions } from "../config/express";
import { debuglog } from "util";

const debug = debuglog("app-express-route-api");


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/latex2svg", (req, res) => {
        // TODO: Cache SVGs
        debug(`Got: id=${req.body.latexStringHash}, string=${req.body.latexString}, `
              + `apiVersion=${req.body.apiVersion}`);
        res.status(200).json({
            svgData: "<svg height=\"180\" width=\"500\">"
                     + "<polyline points=\"0,40 40,40 40,80 80,80 80,120 120,120 120,160\" "
                     + "style=\"fill:white;stroke:red;stroke-width:4\" />"
                     + "</svg>",
            id: req.body.latexStringHash
        });
    });
};
