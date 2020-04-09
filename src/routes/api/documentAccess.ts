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
                const response: types.AddResponse = {
                    id: documentAccessId
                };
                return res.status(200).json(response);
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
                const response: types.AddNameResponse = {
                    id: documentAccessId
                };
                return res.status(200).json(response);
            } catch (error) {
                if (!options.production) { console.error(error); }
                res.status(500).json({ error: error.message ? error.message : error });
            }
        });

};
