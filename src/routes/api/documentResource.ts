import type * as types from "./documentResourceTypes";
import express from "express";
import { StartExpressServerOptions } from "../../config/express";

export type { types };


export default (app: express.Application, options: StartExpressServerOptions): void => {
    // TODO
};
