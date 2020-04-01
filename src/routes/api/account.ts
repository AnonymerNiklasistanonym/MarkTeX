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
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            apiVersion: schemaValidations.getApiVersionSupported({ couldBeString: true }),
            name: { isString: true },
            password: { isString: true }
        }), { sendJsonError: true }),
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
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            apiVersion: schemaValidations.getApiVersionSupported({ couldBeString: true }),
            name: { isString: true },
            password: { isString: true }
        }), { sendJsonError: true }),
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

    app.post("/api/account/get",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported(),
                id: schemaValidations.getAccountIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                })
            }), { sendJsonError: true })(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to login user
        async (req, res) => {
            debug(`Get: ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.GetRequestApi;
            try {
                const accountInfo = await api.database.account.get(options.databasePath, sessionInfo.accountId,
                    request
                );
                if (accountInfo) {
                    const response: types.GetResponse = {
                        admin: accountInfo.admin,
                        id: accountInfo.id,
                        name: accountInfo.name
                    };
                    return res.status(200).json(response);
                }
                throw Error("Internal error: Account info was not returned");
            } catch (error) { return res.status(500).json({ error }); }
        });

    app.post("/api/account/remove",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported(),
                id: schemaValidations.getAccountIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                })
            }), { sendJsonError: true })(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to login user
        async (req, res) => {
            debug(`Remove: ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.RemoveRequestApi;
            try {
                const successful = await api.database.account.remove(options.databasePath, sessionInfo.accountId,
                    request
                );
                if (successful) {
                    const response: types.RemoveResponse = {
                        id: request.id
                    };
                    // When the removed account is the current account remove authentication
                    if (sessionInfo.accountId === request.id) {
                        expressMiddlewareSession.removeAuthentication(req);
                    }
                    return res.status(200).json(response);
                }
                throw Error("Internal error: Account removal was not successful");
            } catch (error) { return res.status(500).json({ error }); }
        });

    app.post("/api/account/update",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported({ couldBeString: true }),
                id: schemaValidations.getAccountIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                }),
                name: { isString: true, optional: true },
                password: { isString: true, optional: true }
            }), { sendJsonError: true })(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to login user
        async (req, res) => {
            debug(`Update: ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.UpdateRequestApi;
            try {
                const successful = await api.database.account.update(options.databasePath, sessionInfo.accountId,
                    request
                );
                const accountInfo = await api.database.account.get(options.databasePath, sessionInfo.accountId, {
                    id: request.id
                });
                if (successful && accountInfo) {
                    const response: types.UpdateResponse = {
                        admin: accountInfo.admin,
                        id: request.id,
                        name: accountInfo.name
                    };
                    return res.status(200).json(response);
                }
                throw Error("Internal error: Account update was not successful");
            } catch (error) { return res.status(500).json({ error }); }
        });

};
