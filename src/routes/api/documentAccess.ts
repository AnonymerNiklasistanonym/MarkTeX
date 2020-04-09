import * as expressMiddlewareSession from "../../middleware/expressSession";
import * as expressMiddlewareValidator  from "../../middleware/expressValidator";
import * as expressValidator from "express-validator";
import * as schemaValidations from "./schemaValidations";
import type * as types from "./documentAccessTypes";
import api from "../../modules/api";
import { debuglog } from "util";
import express from "express";
import { StartExpressServerOptions } from "../../config/express";

export type { types };

const debug = debuglog("app-express-route-api-document-access");


export default (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/document_access/add",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
                accountId: schemaValidations.getAccountIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                }),
                apiVersion: schemaValidations.getApiVersionSupported(),
                documentId: schemaValidations.getDocumentIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                }),
                writeAccess: { isBoolean: true, optional: true }
            }), { sendJsonError: true })(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to export a document to json
        async (req, res) => {
            debug(`Add access ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.AddRequestApi;
            try {
                const documentAccessId = await api.database.documentAccess.add(
                    options.databasePath, sessionInfo.accountId, request
                );
                const documentAccessInfo = await api.database.documentAccess.get(
                    options.databasePath, sessionInfo.accountId, { id: documentAccessId }
                );
                const accountInfo = await api.database.account.get(
                    options.databasePath, sessionInfo.accountId, { id: request.accountId }
                );
                if (documentAccessInfo && accountInfo) {
                    const response: types.AddResponse = {
                        accountId: documentAccessInfo.accountId,
                        accountName: accountInfo.name,
                        documentId: documentAccessInfo.documentId,
                        id: documentAccessId,
                        writeAccess: documentAccessInfo.writeAccess
                    };
                    return res.status(200).json(response);
                }
                throw Error("Creation of document access was not successful");
            } catch (error) {
                if (!options.production) { console.error(error); }
                res.status(500).json({ error: error.message ? error.message : error });
            }
        });

    app.post("/api/document_access/addName",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
                accountName: schemaValidations.getAccountNameExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                }),
                apiVersion: schemaValidations.getApiVersionSupported(),
                documentId: schemaValidations.getDocumentIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                }),
                writeAccess: { isBoolean: true, optional: true }
            }), { sendJsonError: true })(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to export a document to json
        async (req, res) => {
            debug(`Add access (name) ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.AddNameRequestApi;
            try {
                const documentAccessId = await api.database.documentAccess.addName(
                    options.databasePath, sessionInfo.accountId, request
                );
                const documentAccessInfo = await api.database.documentAccess.get(
                    options.databasePath, sessionInfo.accountId, { id: documentAccessId }
                );
                const accountInfo = await api.database.account.getName(
                    options.databasePath, sessionInfo.accountId, { name: request.accountName }
                );
                if (documentAccessInfo && accountInfo) {
                    const response: types.AddNameResponse = {
                        accountId: documentAccessInfo.accountId,
                        accountName: accountInfo.name,
                        documentId: documentAccessInfo.documentId,
                        id: documentAccessId,
                        writeAccess: documentAccessInfo.writeAccess
                    };
                    return res.status(200).json(response);
                }
                throw Error("Creation of document access was not successful");
            } catch (error) {
                if (!options.production) { console.error(error); }
                res.status(500).json({ error: error.message ? error.message : error });
            }
        });

    app.post("/api/document_access/update",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported(),
                id: schemaValidations.getDocumentAccessIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                }),
                writeAccess: { isBoolean: true, optional: true }
            }), { sendJsonError: true })(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to export a document to json
        async (req, res) => {
            debug(`Update access ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
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
                throw Error("Update of document access was not successful");
            } catch (error) {
                if (!options.production) { console.error(error); }
                res.status(500).json({ error: error.message ? error.message : error });
            }
        });

    app.post("/api/document_access/remove",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported(),
                id: schemaValidations.getDocumentAccessIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                })
            }), { sendJsonError: true })(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to export a document to json
        async (req, res) => {
            debug(`Remove access ${JSON.stringify(req.body)}`);
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
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
                throw Error("Removal of document access was not successful");
            } catch (error) {
                if (!options.production) { console.error(error); }
                res.status(500).json({ error: error.message ? error.message : error });
            }
        });

};
