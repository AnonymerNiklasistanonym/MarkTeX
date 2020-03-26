import * as express from "express";
import { StartExpressServerOptions } from "../../config/express";
import * as expressValidator from "express-validator";
import { validateWithTerminationOnError } from "../../middleware/expressValidator";
import * as expressSession from "../../middleware/expressSession";
import type * as types from "./accountTypes";
export type { types };
import { debuglog } from "util";
import * as api from "../../modules/api";


const debug = debuglog("app-express-route-api-account");


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/account/register", async (req, res) => {
        debug("Register");
        if (expressSession.isAuthenticated(req)) {
            // Redirect to home page if already authenticated
            return res.redirect("/");
        }
        const request = req.body as types.RegisterRequestApi;
        try {
            const accountId = await api.database.account.create(options.databasePath, request);
            if (accountId) {
                const response: types.RegisterResponse = {
                    id: accountId,
                    name: request.name
                };
                // Authenticate user
                expressSession.authenticate(req, accountId);
                return res.status(200).json(response);
            }
            return res.status(500).json({
                error: Error("Internal error, no document id was returned")
            });
        } catch (error) {
            return res.status(500).json({ error });
        }
    });

    app.post("/api/account/login", async (req, res) => {
        debug("Login, %s", JSON.stringify(req.body));
        if (expressSession.isAuthenticated(req)) {
            // Redirect to home page if already authenticated
            return res.redirect("/");
        }
        const request = req.body as types.LoginRequestApi;
        try {
            const accountId = await api.database.account.checkLogin(options.databasePath, request);
            if (accountId) {
                const response: types.LoginResponse = {
                    id: accountId,
                    name: request.name
                };
                // Authenticate user
                expressSession.authenticate(req, accountId);
                return res.status(200).json(response);
            }
            return res.status(500).json({
                error: Error("Internal error, no document id was returned")
            });
        } catch (error) {
            return res.status(500).json({ error });
        }
    });

    app.post("/api/account/logout", (req, res) => {
        // Remove authentication
        expressSession.removeAuthentication(req);
        // Redirect to home page
        res.redirect("/");
    });
};
