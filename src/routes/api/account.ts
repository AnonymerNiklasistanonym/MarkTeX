import * as expressSession from "../../middleware/expressSession";
import type * as types from "./accountTypes";
import api from "../../modules/api";
import { debuglog } from "util";
import express from "express";
import { StartExpressServerOptions } from "../../config/express";

export type { types };


const debug = debuglog("app-express-route-api-account");


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/account/register", async (req, res) => {
        debug(`Register: ${JSON.stringify(req.body)}`);
        // Redirect to home page if already authenticated
        if (expressSession.isAuthenticated(req)) {
            return res.redirect("/");
        }
        const request = req.body as types.RegisterRequestApi;
        try {
            const accountId = await api.database.account.create(options.databasePath, request);
            // If register was successful authenticate user
            if (accountId) {
                expressSession.authenticate(req, accountId);
                return res.redirect("/");
            }
            // If register was not successful redirect to login page
            expressSession.addMessages(req, "Registering was not successful");
            return res.redirect("/login");
        } catch (error) {
            // On any error redirect to login page
            const databaseError = api.database.getError(error);
            if (databaseError === api.database.DatabaseError.SQLITE_CONSTRAINT) {
                expressSession.addMessages(req, "The user name already exists");
            } else {
                expressSession.addMessages(req, JSON.stringify(error));
            }
            return res.redirect("/login");
        }
    });

    app.post("/api/account/login", async (req, res) => {
        debug(`Login: ${JSON.stringify(req.body)}`);
        // Redirect to home page if already authenticated
        if (expressSession.isAuthenticated(req)) {
            return res.redirect("/");
        }
        // Try to login
        const request = req.body as types.LoginRequestApi;
        try {
            const accountId = await api.database.account.checkLogin(options.databasePath, request);
            // If login was successful authenticate user
            if (accountId) {
                expressSession.authenticate(req, accountId);
                return res.redirect("/");
            }
            // If register was not successful redirect to login page
            expressSession.addMessages(req, "Login was not successful");
            return res.redirect("/login");
        } catch (error) {
            // On any error redirect to login page
            expressSession.addMessages(req, JSON.stringify(error));
            return res.redirect("/login");
        }
    });

    app.post("/api/account/logout", (req, res) => {
        debug(`Logout: ${JSON.stringify(req.body)}`);
        // Redirect to home page if already authenticated
        if (expressSession.isAuthenticated(req)) {
            return res.redirect("/");
        }
        // Remove authentication and redirect to home page
        expressSession.removeAuthentication(req);
        res.redirect("/");
    });
};
