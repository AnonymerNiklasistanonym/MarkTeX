import * as expressSession from "../../middleware/expressSession";
import type * as types from "./groupTypes";
import api from "../../modules/api";
import express from "express";
import { StartExpressServerOptions } from "../../config/express";

export type { types };


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/group/create", (req, res) => {
        // TODO
    });

    app.post("/api/group/get", (req, res) => {
        // TODO
    });

    app.post("/api/group/remove", (req, res) => {
        // TODO
    });

    app.post("/api/group/update", (req, res) => {
        // TODO
    });
};
