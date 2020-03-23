import * as express from "express";
import { StartExpressServerOptions } from "../config/express";

import * as latex2svg from "./api/latex2svg";
import * as document from "./api/document";

export const register = (app: express.Application, options: StartExpressServerOptions): void => {
    latex2svg.register(app, options);
    document.register(app, options);
};
