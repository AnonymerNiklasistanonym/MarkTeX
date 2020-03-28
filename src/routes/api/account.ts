import * as expressMiddlewareSession from "../../middleware/expressSession";
import * as expressMiddlewareValidator from "../../middleware/expressValidator";
import * as expressValidator from "express-validator";
import * as schemaValidations from "./schemaValidations";
import type * as types from "./accountTypes";
import api from "../../modules/api";
import { debuglog } from "util";
import express from "express";
import { StartExpressServerOptions } from "../../config/express";

export type { types };


const debug = debuglog("app-express-route-api-account");


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/account/register",
        // Validate api input
        expressMiddlewareValidator.validateWithTerminationOnError(expressValidator.checkSchema({
            apiVersion: schemaValidations.getApiVersionSupported({ couldBeString: true }),
            name: { isString: true },
            password: { isString: true }
        })),
        // Redirect to home page if already authenticated
        expressMiddlewareSession.redirectIfAuthenticated(),
        // Try to register user
        async (req, res) => {
            debug(`Register: ${JSON.stringify(req.body)}`);
            const request = req.body as types.RegisterRequestApi;
            try {
                const accountId = await api.database.account.create(options.databasePath, request);
                // If register was successful authenticate user and redirect to home page
                if (accountId) {
                    expressMiddlewareSession.authenticate(req, accountId);
                    return res.redirect("/");
                }
                // If register was not successful redirect to login page
                expressMiddlewareSession.addMessages(req, "Registering was not successful");
                return res.redirect("/login");
            } catch (error) {
                // On any error redirect to login page
                const databaseError = api.database.getError(error);
                // Check if error is a database specific error
                if (databaseError === api.database.DatabaseError.SQLITE_CONSTRAINT) {
                    expressMiddlewareSession.addMessages(req, "The user name already exists");
                } else {
                    expressMiddlewareSession.addMessages(req, JSON.stringify(error));
                }
                return res.redirect("/login");
            }
        });

    app.post("/api/account/login",
        // Validate api input
        expressMiddlewareValidator.validateWithTerminationOnError(expressValidator.checkSchema({
            apiVersion: schemaValidations.getApiVersionSupported({ couldBeString: true }),
            name: { isString: true },
            password: { isString: true }
        })),
        // Redirect to home page if already authenticated
        expressMiddlewareSession.redirectIfAuthenticated(),
        // Try to login user
        async (req, res) => {
            debug(`Login: ${JSON.stringify(req.body)}`);
            const request = req.body as types.LoginRequestApi;
            try {
                const accountId = await api.database.account.checkLogin(options.databasePath, request);
                // If login was successful authenticate user and redirect to home page
                if (accountId) {
                    expressMiddlewareSession.authenticate(req, accountId);
                    return res.redirect("/");
                }
                // If login was not successful redirect back to login page
                expressMiddlewareSession.addMessages(req, "Login was not successful");
                return res.redirect("/login");
            } catch (error) {
                // On any error redirect to login page
                expressMiddlewareSession.addMessages(req, JSON.stringify(error));
                return res.redirect("/login");
            }
        });

};
