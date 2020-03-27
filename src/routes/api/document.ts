import * as expressSession from "../../middleware/expressSession";
import * as expressValidator from "express-validator";
import type * as types from "./documentTypes";
import api from "../../modules/api";
import { debuglog } from "util";
import express from "express";
import { StartExpressServerOptions } from "../../config/express";
import { validateWithTerminationOnError } from "../../middleware/expressValidator";

export type { types };


const debug = debuglog("app-express-route-api-document");

export interface InputSchemaValidationExistingDocumentId {
    databasePath: string
    accountId: number
}

const getSchemaValidationExistingDocumentId = (
    input: InputSchemaValidationExistingDocumentId
): expressValidator.ValidationParamSchema => {
    return {
        custom: {
            options: async (id: number): Promise<boolean> => {
                const documentExists = await api.database.document.exists(input.databasePath, input.accountId, { id });
                return documentExists !== undefined ? documentExists : false;
            }
        },
        errorMessage: "Must be an existing document id",
        isInt: true
    };
};

const schemaValidationDocumentId: expressValidator.ValidationParamSchema = {
    errorMessage: "Not an int",
    isInt: true
};
const schemaValidationDocumentContent: expressValidator.ValidationParamSchema = {
    errorMessage: "Not a string",
    isString: true
};
const schemaValidationDocumentTitle: expressValidator.ValidationParamSchema = {
    errorMessage: "Not a string",
    isString: true
};
const schemaValidationDocumentAuthors: expressValidator.ValidationParamSchema = {
    errorMessage: "Not a string",
    isString: true,
    optional: true
};
const schemaValidationDocumentDate: expressValidator.ValidationParamSchema = {
    errorMessage: "Not a string",
    isString: true,
    optional: true
};
const schemaValidationDocumentResources: expressValidator.ValidationParamSchema = {
    custom: {
        options: (documentResources: any[]): boolean => {
            for (const documentResource of documentResources) {
                if (typeof documentResource !== "string") {
                    throw new Error("Document resources are not a string array");
                }
            }
            return true;
        }
    },
    errorMessage: "Not an array",
    isArray: true,
    optional: true
};
const schemaValidationApiVersion: expressValidator.ValidationParamSchema = {
    custom: {
        options: (apiVersion: number): boolean => {
            if (apiVersion === 1) {
                return true;
            }
            throw new Error("API version is not supported");
        }
    },
    isInt: true
};


export interface CreateResponse {
    id: number
    title: string
    authors?: string
    date?: string
}


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/document/create",
        expressSession.checkAuthenticationJson,
        validateWithTerminationOnError(expressValidator.checkSchema({
            apiVersion: schemaValidationApiVersion,
            authors: schemaValidationDocumentAuthors,
            content: schemaValidationDocumentContent,
            date: schemaValidationDocumentDate,
            resources: schemaValidationDocumentResources,
            title: schemaValidationDocumentTitle
        })),
        async (req, res) => {
            debug("Create document");
            const sessionInfo = expressSession.getSessionInfo(req);
            const request = req.body as types.CreateRequest;
            try {
                const documentId = await api.database.document.create(options.databasePath, sessionInfo.accountId,
                    request
                );
                if (documentId) {
                    const response: types.CreateResponse = {
                        authors: request.authors,
                        date: request.date,
                        id: documentId,
                        title: request.title
                    };
                    return res.status(200).json(response);
                }
                return res.status(500).json({
                    error: Error("Internal error, no document id was returned")
                });
            } catch (error) {
                return res.status(500).json({ error });
            }
        });
    app.post("/api/document/get", validateWithTerminationOnError(expressValidator.checkSchema({
        apiVersion: schemaValidationApiVersion,
        documentId: schemaValidationDocumentId
    })), (req, res) => {
        debug("Get document");
        try {
            // const getDocument = await api.content.getDocument(req.body.accountId, req.body.documentId);
            return res.status(405).json({ error: Error("Not yet implemented") });
        } catch (error) {
            return res.status(500).json({ error });
        }
    });
    app.post("/api/document/export", validateWithTerminationOnError(expressValidator.checkSchema({
        apiVersion: schemaValidationApiVersion,
        documentId: schemaValidationDocumentId
    })), (req, res) => {
        debug("Export document");
        try {
            // const exportDocument = api.content.exportDocument();
            return res.status(405).json({ error: Error("Not yet implemented") });
        } catch (error) {
            return res.status(500).json({ error });
        }
    });
    app.post("/api/document/update",
        expressSession.checkAuthenticationJson,
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressSession.SessionInfo;
            await validateWithTerminationOnError(expressValidator.checkSchema({
                apiVersion: schemaValidationApiVersion,
                authors: { isInt: true, optional: true },
                content: { isString: true, optional: true },
                date: { isString: true, optional: true },
                id: getSchemaValidationExistingDocumentId({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                }),
                title: { isString: true, optional: true }
            }))(req, res, next);
        },
        async (req, res) => {
            debug("Update document");
            const sessionInfo = expressSession.getSessionInfo(req);
            const request = req.body as types.UpdateRequest;
            try {
                const documentId = await api.database.document.update(options.databasePath, sessionInfo.accountId,
                    request
                );
                const documentInfo = await api.database.document.get(options.databasePath, { id: request.id });
                if (documentId && documentInfo) {
                    const response: types.UpdateResponse = {
                        authors: documentInfo.authors,
                        date: documentInfo.date,
                        id: request.id,
                        title: documentInfo.title
                    };
                    return res.status(200).json(response);
                }
                return res.status(500).json({
                    error: Error("Internal error, no document id was returned")
                });
            } catch (error) {
                return res.status(500).json({ error });
            }
        });
};
