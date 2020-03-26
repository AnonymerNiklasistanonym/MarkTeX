import * as express from "express";
import { StartExpressServerOptions } from "../../config/express";
import { debuglog } from "util";
import * as api from "../../modules/api";
import * as expressValidator from "express-validator";
import { validateWithTerminationOnError } from "../../middleware/expressValidator";
import * as expressSession from "../../middleware/expressSession";
import type * as types from "./documentTypes";
export type { types };


const debug = debuglog("app-express-route-api-document");


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
    optional: true,
    errorMessage: "Not a string",
    isString: true
};
const schemaValidationDocumentDate: expressValidator.ValidationParamSchema = {
    optional: true,
    errorMessage: "Not a string",
    isString: true
};
const schemaValidationDocumentResources: expressValidator.ValidationParamSchema = {
    optional: true,
    errorMessage: "Not an array",
    isArray: true,
    custom: {
        options: (documentResources: any[]): boolean => {
            for (const documentResource of documentResources) {
                if (typeof documentResource !== "string") {
                    throw new Error("Document resources are not a string array");
                }
            }
            return true;
        }
    }
};
const schemaValidationApiVersion: expressValidator.ValidationParamSchema = {
    isInt: true,
    custom: {
        options: (apiVersion: number): boolean => {
            if (apiVersion === 1) {
                return true;
            }
            throw new Error("API version is not supported");
        }
    }
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
            content: schemaValidationDocumentContent,
            title: schemaValidationDocumentTitle,
            authors: schemaValidationDocumentAuthors,
            date: schemaValidationDocumentDate,
            resources: schemaValidationDocumentResources,
            apiVersion: schemaValidationApiVersion
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
                        id: documentId,
                        title: request.title,
                        date: request.date,
                        authors: request.authors
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
        documentId: schemaValidationDocumentId,
        apiVersion: schemaValidationApiVersion
    })), async (req, res) => {
        debug("Get document");
        try {
            const getDocument = await api.content.getDocument(req.body.accountId, req.body.documentId);
            return res.status(405).json({ error: Error("Not yet implemented") });
        } catch (error) {
            return res.status(500).json({ error });
        }
    });
    app.post("/api/document/export", validateWithTerminationOnError(expressValidator.checkSchema({
        documentId: schemaValidationDocumentId,
        apiVersion: schemaValidationApiVersion
    })), (req, res) => {
        debug("Export document");
        try {
            const exportDocument = api.content.exportDocument();
            return res.status(405).json({ error: Error("Not yet implemented") });
        } catch (error) {
            return res.status(500).json({ error });
        }
    });
    app.post("/api/document/update",
        expressSession.checkAuthenticationJson,
        validateWithTerminationOnError(expressValidator.checkSchema({
            documentId: schemaValidationDocumentId,
            documentContent: schemaValidationDocumentContent,
            documentResources: schemaValidationDocumentResources,
            apiVersion: schemaValidationApiVersion
        })),
        (req, res) => {
            debug("Update document");
            try {
                const updateDocument = api.content.updateDocument();
                return res.status(405).json({ error: Error("Not yet implemented") });
            } catch (error) {
                return res.status(500).json({ error });
            }
        });
};
