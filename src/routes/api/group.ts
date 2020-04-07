import * as expressMiddlewareSession from "../../middleware/expressSession";
import * as expressMiddlewareValidator  from "../../middleware/expressValidator";
import * as expressValidator from "express-validator";
import * as schemaValidations from "./schemaValidations";
import type * as types from "./groupTypes";
import api from "../../modules/api";
import { debuglog } from "util";
import express from "express";
import { StartExpressServerOptions } from "../../config/express";

export type { types };


const debug = debuglog("app-express-route-api-group");


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/group/create",
        // Validate api input
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            apiVersion: schemaValidations.getApiVersionSupported(),
            name: { isString: true },
            owner: { isInt: true },
            public: { isBoolean: true, optional: true }
        }), { sendJsonError: true }),
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to create a new group
        async (req, res) => {
            debug(`Create group ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.CreateRequest;
            try {
                const groupId = await api.database.group.create(
                    options.databasePath, sessionInfo.accountId, request
                );
                const response: types.CreateResponse = {
                    id: groupId,
                    name: request.name,
                    owner: request.owner,
                    public: request.public !== undefined ? request.public : false
                };
                return res.status(200).json(response);
            } catch (error) { return res.status(500).json({ error }); }
        });

    app.post("/api/group/get",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported(),
                id: schemaValidations.getGroupIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                })
            }), { sendJsonError: true })(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to get a group
        async (req, res) => {
            debug(`Get group ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.GetRequest;
            try {
                const groupInfo = await api.database.group.get(
                    options.databasePath, sessionInfo.accountId, request
                );
                if (groupInfo) {
                    const response: types.GetResponse = {
                        id: request.id,
                        name: groupInfo.name,
                        owner: groupInfo.owner,
                        public: groupInfo.public
                    };
                    return res.status(200).json(response);
                }
                throw Error("Internal error: No document info was returned");
            } catch (error) { return res.status(500).json({ error }); }
        });

    app.post("/api/group/remove",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported(),
                id: schemaValidations.getGroupIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                })
            }), { sendJsonError: true })(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to remove a group
        async (req, res) => {
            debug(`Remove group ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.RemoveRequestApi;
            try {
                const successful = await api.database.group.remove(
                    options.databasePath, sessionInfo.accountId, request
                );
                if (successful) {
                    const response: types.RemoveResponse = {
                        id: request.id
                    };
                    return res.status(200).json(response);
                }
                throw Error("Internal error: Group removal was not successful");
            } catch (error) { return res.status(500).json({ error }); }
        });

    app.post("/api/group/update",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported(),
                id: schemaValidations.getGroupIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                }),
                name: { isString: true, optional: true }
            }), { sendJsonError: true })(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to update a group
        async (req, res) => {
            debug(`Update group ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.UpdateRequestApi;
            try {
                const successful = await api.database.group.update(
                    options.databasePath, sessionInfo.accountId, request
                );
                const groupInfo = await api.database.group.get(
                    options.databasePath, sessionInfo.accountId, { id: request.id }
                );
                if (successful && groupInfo) {
                    const response: types.UpdateResponse = {
                        id: request.id,
                        name: groupInfo.name,
                        owner: groupInfo.owner,
                        public: groupInfo.public
                    };
                    return res.status(200).json(response);
                }
                throw Error("Internal error: Document update was not successful");
            } catch (error) { return res.status(500).json({ error }); }
        });
};
