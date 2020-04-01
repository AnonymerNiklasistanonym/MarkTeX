import * as expressMiddlewareSession from "../../middleware/expressSession";
import * as expressMiddlewareValidator  from "../../middleware/expressValidator";
import * as expressValidator from "express-validator";
import * as schemaValidations from "./schemaValidations";
import type * as types from "./documentTypes";
import api from "../../modules/api";
import { debuglog } from "util";
import express from "express";
import { StartExpressServerOptions } from "../../config/express";

export type { types };


const debug = debuglog("app-express-route-api-document");


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/document/create",
        // Validate api input
        expressMiddlewareValidator.validateWithTerminationOnError(expressValidator.checkSchema({
            apiVersion: schemaValidations.getApiVersionSupported(),
            authors: { isString: true, optional: true },
            content: { isString: true },
            date: { isString: true, optional: true },
            pdfOptions: schemaValidations.getDocumentPdfOptions(),
            title: { isString: true }
        })),
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to create a new document
        async (req, res) => {
            debug("Create document");
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.CreateRequest;
            try {
                const documentId = await api.database.document.create(
                    options.databasePath, sessionInfo.accountId, request
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
                throw Error("Internal error: No document id was returned");
            } catch (error) { return res.status(500).json({ error }); }
        });

    app.post("/api/document/get",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithTerminationOnError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported(),
                getContent: { isBoolean: true, optional: true },
                getPdfOptions: { isBoolean: true, optional: true },
                id: schemaValidations.getDocumentIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                })
            }))(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to get a document
        async (req, res) => {
            debug("Get document");
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.GetRequest;
            try {
                const documentInfo = await api.database.document.get(
                    options.databasePath, sessionInfo.accountId, request
                );
                if (documentInfo) {
                    const response: types.GetResponse = {
                        authors: documentInfo.authors,
                        content: documentInfo.content,
                        date: documentInfo.date,
                        id: request.id,
                        pdfOptions: documentInfo.pdfOptions,
                        title: documentInfo.title
                    };
                    return res.status(200).json(response);
                }
                throw Error("Internal error: No document info was returned");
            } catch (error) { return res.status(500).json({ error }); }
        });

    app.post("/api/document/update",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithTerminationOnError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported(),
                authors: { isString: true, optional: true },
                content: { isString: true, optional: true },
                date: { isString: true, optional: true },
                id: schemaValidations.getDocumentIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                }),
                pdfOptions: schemaValidations.getDocumentPdfOptions(),
                title: { isString: true, optional: true }
            }))(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to update a document
        async (req, res) => {
            debug("Update document");
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.UpdateRequestApi;
            try {
                const successful = await api.database.document.update(
                    options.databasePath, sessionInfo.accountId, request
                );
                const documentInfo = await api.database.document.get(
                    options.databasePath, sessionInfo.accountId, { id: request.id }
                );
                if (successful && documentInfo) {
                    const response: types.UpdateResponse = {
                        authors: documentInfo.authors,
                        date: documentInfo.date,
                        id: request.id,
                        title: documentInfo.title
                    };
                    return res.status(200).json(response);
                }
                throw Error("Internal error: Document update was not successful");
            } catch (error) { return res.status(500).json({ error }); }
        });

    app.post("/api/document/remove",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithTerminationOnError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported(),
                id: schemaValidations.getDocumentIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                })
            }))(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to remove a document
        async (req, res) => {
            debug("Remove document");
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.RemoveRequestApi;
            try {
                const successful = await api.database.document.remove(
                    options.databasePath, sessionInfo.accountId, request
                );
                if (successful) {
                    const response: types.RemoveResponse = {
                        id: request.id
                    };
                    return res.status(200).json(response);
                }
                throw Error("Internal error: Account removal was not successful");
            } catch (error) { return res.status(500).json({ error }); }
        });

    app.post("/api/document/export/pdf",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithTerminationOnError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported(),
                id: schemaValidations.getDocumentIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                })
            }))(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to export a document to pdf
        async (req, res) => {
            debug("Export document [pdf]");
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.ExportPdfRequestApi;
            try {
                const documentInfo = await api.database.document.get(
                    options.databasePath, sessionInfo.accountId,
                    { ... request, getContent: true, getPdfOptions: true }
                );
                if (documentInfo) {
                    const pdfData = await api.pandoc.createPdf({
                        authors: documentInfo.authors,
                        content: documentInfo.content,
                        date: documentInfo.date,
                        pdfOptions: documentInfo.pdfOptions,
                        title: documentInfo.title
                    });
                    const response: types.ExportPdfResponse = {
                        id: request.id,
                        pdfData: pdfData.pdfData
                    };
                    return res.status(200).json(response);
                }
                throw Error("Internal error: No document info was returned");
            } catch (error) { return res.status(500).json({ error }); }
        });

    app.post("/api/document/export/zip",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithTerminationOnError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported(),
                id: schemaValidations.getDocumentIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                })
            }))(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to export a documents source files to zip
        async (req, res) => {
            debug("Export document [zip]");
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.ExportZipRequestApi;
            try {
                const documentInfo = await api.database.document.get(
                    options.databasePath, sessionInfo.accountId,
                    { ... request, getContent: true, getPdfOptions: true }
                );
                if (documentInfo) {
                    const zipData = await api.pandoc.createSourceZip({
                        authors: documentInfo.authors,
                        content: documentInfo.content,
                        date: documentInfo.date,
                        pdfOptions: documentInfo.pdfOptions,
                        title: documentInfo.title
                    });
                    const response: types.ExportZipResponse = {
                        id: request.id,
                        zipData: zipData.zipData
                    };
                    return res.status(200).json(response);
                }
                throw Error("Internal error: No document info was returned");
            } catch (error) { return res.status(500).json({ error }); }
        });

    app.post("/api/document/export/json",
        // Validate api input
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithTerminationOnError(expressValidator.checkSchema({
                apiVersion: schemaValidations.getApiVersionSupported(),
                id: schemaValidations.getDocumentIdExists({
                    accountId: sessionInfo.accountId,
                    databasePath: options.databasePath
                })
            }))(req, res, next);
        },
        // Check if session is authenticated
        expressMiddlewareSession.checkAuthenticationJson,
        // Try to export a document to json
        async (req, res) => {
            debug("Export document [json]");
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            const request = req.body as types.ExportJsonRequestApi;
            try {
                const documentInfo = await api.database.document.get(
                    options.databasePath, sessionInfo.accountId,
                    { ... request, getContent: true, getPdfOptions: true }
                );
                if (documentInfo) {
                    const response: types.ExportJsonResponse = {
                        id: request.id,
                        jsonData: {
                            authors: documentInfo.authors,
                            content: documentInfo.content,
                            date: documentInfo.date,
                            pdfOptions: documentInfo.pdfOptions,
                            public: documentInfo.public,
                            title: documentInfo.title
                        }
                    };
                    return res.status(200).json(response);
                }
                throw Error("Internal error: No document info was returned");
            } catch (error) { return res.status(500).json({ error }); }
        });
};
