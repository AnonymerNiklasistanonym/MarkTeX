import type * as types from "./groupAccessTypes";
import express from "express";
import { StartExpressServerOptions } from "../../config/express";

export type { types };


export const register = (app: express.Application, options: StartExpressServerOptions): void => {
    // TODO
};
