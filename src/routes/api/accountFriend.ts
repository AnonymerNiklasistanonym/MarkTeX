import * as expressMiddlewareSession from "../../middleware/expressSession";
import * as expressMiddlewareValidator from "../../middleware/expressValidator";
import * as expressValidator from "express-validator";
import * as schemaValidations from "./schemaValidations";
import type * as types from "./accountFriendTypes";
import api from "../../modules/api";
import { debuglog } from "util";
import express from "express";
import { StartExpressServerOptions } from "../../config/express";

export type { types };


const debug = debuglog("app-express-route-api-account-friend");


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/account_friend/add",
        // Validate api input
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            accountId: { isInt: true },
            apiVersion: schemaValidations.getApiVersionSupported({ couldBeString: true }),
            friendId: { isInt: true }
        }), { sendJsonError: true }),
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to create user
        async (req, res) => {
            debug(`Add: ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.AddRequestApi;
            try {
                const accountFriendEntryId = await api.database.accountFriend.create(
                    options.databasePath, sessionInfo.accountId, request
                );
                const response: types.AddResponse = {
                    id: accountFriendEntryId
                };
                res.status(200).json(response);
            } catch (error) {
                if (!options.production) { console.error(error); }
                res.status(500).json({ error });
            }
        });

    app.post("/api/account_friend/get",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported(),
                id: schemaValidations.getAccountFriendIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                })
            }), { sendJsonError: true })(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to get account info
        async (req, res) => {
            debug(`Get: ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.GetRequestApi;
            try {
                const accountFriendEntryInfo = await api.database.accountFriend.get(
                    options.databasePath, sessionInfo.accountId, request
                );
                if (accountFriendEntryInfo) {
                    const response: types.GetResponse = {
                        accountId: accountFriendEntryInfo.accountId,
                        friendId: accountFriendEntryInfo.friendId,
                        id: accountFriendEntryInfo.id
                    };
                    return res.status(200).json(response);
                }
                throw Error("Internal error: Account friend entry info was not returned");
            } catch (error) {
                if (!options.production) { console.error(error); }
                res.status(500).json({ error });
            }
        });

    app.post("/api/account_friend/remove",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported(),
                id: schemaValidations.getAccountFriendIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                })
            }), { sendJsonError: true })(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to remove user
        async (req, res) => {
            debug(`Remove: ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.RemoveRequestApi;
            try {
                const successful = await api.database.accountFriend.remove(
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
                throw Error("Internal error: Account friend entry removal was not successful");
            } catch (error) {
                if (!options.production) { console.error(error); }
                res.status(500).json({ error });
            }
        });

};
