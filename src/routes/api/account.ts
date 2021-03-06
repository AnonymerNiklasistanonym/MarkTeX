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


export default (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/account/create",
        // Validate api input
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            apiVersion: schemaValidations.getApiVersionSupported({ couldBeString: true }),
            name: { isString: true },
            password: { isString: true }
        }), { sendJsonError: true }),
        // Redirect to home page if already authenticated
        expressMiddlewareSession.redirectIfAuthenticated(),
        // Try to create user
        async (req, res) => {
            debug(`Create: ${JSON.stringify(req.body)}`);
            const request = req.body as types.CreateRequestApi;
            try {
                const accountId = await api.database.account.create(options.databasePath, request);
                // If register was successful authenticate user and redirect to home page
                expressMiddlewareSession.authenticate(req, accountId);
                const response: types.CreateResponse = {
                    id: accountId
                };
                res.status(200).json(response);
            } catch (error) {
                if (!options.production) { console.error(error); }
                return res.status(500).json({ error: (error as Error).message });
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
                    const response: types.LoginResponse = {
                        id: accountId
                    };
                    return res.status(200).json(response);
                }
                throw Error("Login was not successful");
            } catch (error) {
                if (!options.production) { console.error(error); }
                return res.status(500).json({ error: (error as Error).message });
            }
        });

    app.post("/api/account/get",
        // Validate api input
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            apiVersion: schemaValidations.getApiVersionSupported(),
            id: schemaValidations.getAccountIdExists({
                databasePath: options.databasePath
            })
        }), { sendJsonError: true }),
        // Try to get account info
        async (req, res) => {
            debug(`Get: ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.GetRequestApi;
            try {
                const accountInfo = await api.database.account.get(
                    options.databasePath, sessionInfo.accountId, request
                );
                if (accountInfo) {
                    const response: types.GetResponse = {
                        admin: accountInfo.admin,
                        id: accountInfo.id,
                        name: accountInfo.name,
                        public: accountInfo.public
                    };
                    return res.status(200).json(response);
                }
                throw Error("Internal error: Account info was not returned");
            } catch (error) {
                if (!options.production) { console.error(error); }
                return res.status(500).json({ error: (error as Error).message });
            }
        });

    app.post("/api/account/remove",
        // Validate api input
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            apiVersion: schemaValidations.getApiVersionSupported(),
            id: schemaValidations.getAccountIdExists({
                databasePath: options.databasePath
            })
        }), { sendJsonError: true }),
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to remove user
        async (req, res) => {
            debug(`Remove: ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfoAuthenticated(req);
            const request = req.body as types.RemoveRequestApi;
            try {
                const successful = await api.database.account.remove(
                    options.databasePath, sessionInfo.accountId, request
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
            } catch (error) {
                if (!options.production) { console.error(error); }
                return res.status(500).json({ error: (error as Error).message });
            }
        });

    app.post("/api/account/update",
        // Validate api input
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            apiVersion: schemaValidations.getApiVersionSupported({ couldBeString: true }),
            currentPassword: { isString: true },
            id: schemaValidations.getAccountIdExists({
                databasePath: options.databasePath
            }),
            name: { isString: true, optional: true },
            password: { isString: true, optional: true },
            public: { isBoolean: true, optional: true }
        }), { sendJsonError: true }),
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to login user
        async (req, res) => {
            debug(`Update: ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfoAuthenticated(req);
            const request = req.body as types.UpdateRequestApi;
            try {
                const currentPasswordMatchesLoggedInAccount = await api.database.account.checkLoginId(
                    options.databasePath, { id: sessionInfo.accountId, password: request.currentPassword }
                );
                if (!currentPasswordMatchesLoggedInAccount) {
                    throw Error("Account update was not successful because the current password was incorrect");
                }
                // When requested to change the admin status check if account is admin
                if (request.admin !== undefined) {
                    const accountInfoAdmin = await api.database.account.get(
                        options.databasePath, sessionInfo.accountId, { id: request.id }
                    );
                    if (!(accountInfoAdmin && accountInfoAdmin.admin)) {
                        throw Error(
                            "Account update was not successful because to change admin state account must be admin"
                        );
                    }
                }
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
                        name: accountInfo.name,
                        public: accountInfo.public
                    };
                    return res.status(200).json(response);
                }
                throw Error("Account update was not successful");
            } catch (error) {
                if (!options.production) { console.error(error); }
                return res.status(500).json({ error: (error as Error).message });
            }
        });

};
