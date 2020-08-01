import * as expressMiddlewareSession from "../../middleware/expressSession";
import * as expressMiddlewareValidator  from "../../middleware/expressValidator";
import * as expressValidator from "express-validator";
import * as schemaValidations from "./schemaValidations";
import type * as types from "./groupAccessTypes";
import api from "../../modules/api";
import { debuglog } from "util";
import express from "express";
import { StartExpressServerOptions } from "../../config/express";

export type { types };


const debug = debuglog("app-express-route-api-group-access");


export default (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/group_access/add",
        // Validate api input
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            accountId: schemaValidations.getAccountIdExists({
                databasePath: options.databasePath
            }),
            apiVersion: schemaValidations.getApiVersionSupported(),
            groupId: schemaValidations.getGroupIdExists({
                databasePath: options.databasePath
            }),
            writeAccess: { isBoolean: true, optional: true }
        }), { sendJsonError: true }),
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to export a document to json
        async (req, res) => {
            debug(`Add access ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfoAuthenticated(req);
            const request = req.body as types.AddRequestApi;
            try {
                const groupAccessId = await api.database.groupAccess.add(
                    options.databasePath, sessionInfo.accountId, request
                );
                const groupAccessInfo = await api.database.groupAccess.get(
                    options.databasePath, sessionInfo.accountId, { id: groupAccessId }
                );
                const accountInfo = await api.database.account.get(
                    options.databasePath, sessionInfo.accountId, { id: request.accountId }
                );
                if (groupAccessInfo && accountInfo) {
                    const response: types.AddResponse = {
                        accountId: groupAccessInfo.accountId,
                        accountName: accountInfo.name,
                        groupId: groupAccessInfo.groupId,
                        id: groupAccessId,
                        writeAccess: groupAccessInfo.writeAccess
                    };
                    return res.status(200).json(response);
                }
                throw Error("Creation of group access was not successful");
            } catch (error) {
                if (!options.production) { console.error(error); }
                return res.status(500).json({ error: (error as Error).message });
            }
        });

    app.post("/api/group_access/addName",
        // Validate api input
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            accountName: schemaValidations.getAccountNameExists({
                databasePath: options.databasePath
            }),
            apiVersion: schemaValidations.getApiVersionSupported(),
            groupId: schemaValidations.getGroupIdExists({
                databasePath: options.databasePath
            }),
            writeAccess: { isBoolean: true, optional: true }
        }), { sendJsonError: true }),
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to export a document to json
        async (req, res) => {
            debug(`Add access (name) ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfoAuthenticated(req);
            const request = req.body as types.AddNameRequestApi;
            try {
                const groupAccessId = await api.database.groupAccess.addName(
                    options.databasePath, sessionInfo.accountId, request
                );
                const groupAccessInfo = await api.database.groupAccess.get(
                    options.databasePath, sessionInfo.accountId, { id: groupAccessId }
                );
                const accountInfo = await api.database.account.getName(
                    options.databasePath, sessionInfo.accountId, { name: request.accountName }
                );
                if (groupAccessInfo && accountInfo) {
                    const response: types.AddNameResponse = {
                        accountId: groupAccessInfo.accountId,
                        accountName: accountInfo.name,
                        groupId: groupAccessInfo.groupId,
                        id: groupAccessId,
                        writeAccess: groupAccessInfo.writeAccess
                    };
                    return res.status(200).json(response);
                }
                throw Error("Creation of group access was not successful");
            } catch (error) {
                if (!options.production) { console.error(error); }
                return res.status(500).json({ error: (error as Error).message });
            }
        });

    app.post("/api/group_access/update",
        // Validate api input
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            apiVersion: schemaValidations.getApiVersionSupported(),
            id: schemaValidations.getGroupAccessIdExists({
                databasePath: options.databasePath
            }),
            writeAccess: { isBoolean: true, optional: true }
        }), { sendJsonError: true }),
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to export a document to json
        async (req, res) => {
            debug(`Update access ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfoAuthenticated(req);
            const request = req.body as types.UpdateRequestApi;
            try {
                const successful = await api.database.documentAccess.update(
                    options.databasePath, sessionInfo.accountId, request
                );
                if (successful) {
                    const response: types.UpdateResponse = {
                        id: request.id,
                        writeAccess: request.writeAccess ? true : false
                    };
                    return res.status(200).json(response);
                }
                throw Error("Update of group access was not successful");
            } catch (error) {
                if (!options.production) { console.error(error); }
                return res.status(500).json({ error: (error as Error).message });
            }
        });

    app.post("/api/group_access/remove",
        // Validate api input
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            apiVersion: schemaValidations.getApiVersionSupported(),
            id: schemaValidations.getGroupAccessIdExists({
                databasePath: options.databasePath
            })
        }), { sendJsonError: true }),
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to export a document to json
        async (req, res) => {
            debug(`Remove access ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfoAuthenticated(req);
            const request = req.body as types.RemoveRequestApi;
            try {
                const successful = await api.database.documentAccess.remove(
                    options.databasePath, sessionInfo.accountId, request
                );
                if (successful) {
                    const response: types.RemoveResponse = {
                        id: request.id
                    };
                    return res.status(200).json(response);
                }
                throw Error("Removal of group access was not successful");
            } catch (error) {
                if (!options.production) { console.error(error); }
                return res.status(500).json({ error: (error as Error).message });
            }
        });

};
