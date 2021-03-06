import * as expressMiddlewareSession from "../middleware/expressSession";
import * as expressMiddlewareValidator from "../middleware/expressValidator";
import * as expressValidator from "express-validator";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import createHttpError from "http-errors";
import express from "express";
import { PdfOptionsPaperSize } from "../modules/api/databaseManager/documentPdfOptions";
import { StartExpressServerOptions } from "../config/express";


// Export all document routes
export default (app: express.Application, options: StartExpressServerOptions): void => {

    // View document
    app.get("/document/:id",
        // Make sure that the document exists
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            id: {
                custom: {
                    options: async (id: number): Promise<boolean> => {
                        const documentExists = await api.database.document.exists(
                            options.databasePath, { id }
                        );
                        if (documentExists) { return true; }
                        throw Error(`The document with the id ${id} does not exist`);
                    }
                },
                in: "params",
                isInt: true
            }
        })),
        // eslint-disable-next-line complexity
        async (req, res, next) => {
            let accountId: number|undefined;
            const loggedIn = expressMiddlewareSession.isAuthenticated(req);
            if (loggedIn) {
                accountId =  expressMiddlewareSession.getSessionInfo(req).accountId;
            }
            const documentId = Number(req.params.id);
            try {
                const documentInfo = await api.database.document.get(options.databasePath, accountId, {
                    getContent: true,
                    getPdfOptions: true,
                    id: documentId
                });
                if (documentInfo) {
                    let owner = {
                        id: documentInfo.owner,
                        name: "Private",
                        public: false
                    };
                    try {
                        const temp = await api.database.account.get(options.databasePath, accountId, {
                            id: documentInfo.owner
                        });
                        if (temp) {
                            owner = temp;
                        }
                    } catch (error) {
                        // Nothing?
                    }
                    let group = {};
                    try {
                        const temp = documentInfo.group ? await api.database.group.get(
                            options.databasePath, accountId, { id: documentInfo.group }
                        ) : undefined;
                        if (temp) {
                            group = temp;
                        }
                    } catch (error) {
                        // Nothing?
                    }
                    const members =  await api.database.document.getMembers(
                        options.databasePath, accountId, { id: documentId }
                    );
                    if (!documentInfo.pdfOptions) { documentInfo.pdfOptions = {}; }
                    if (!documentInfo.pdfOptions.tableOfContents) { documentInfo.pdfOptions.tableOfContents = {}; }
                    if (!documentInfo.pdfOptions.header) { documentInfo.pdfOptions.header = {}; }
                    if (!documentInfo.pdfOptions.footer) { documentInfo.pdfOptions.footer = {}; }
                    const pdfOptions: viewRendering.pdfOptions.PdfOption[] = [ {
                        attribute: documentInfo.pdfOptions.useTitle ? "checked" : undefined,
                        isCheckbox: true,
                        label: "Use title",
                        labelAfter: true,
                        name: "use-title",
                        type: "checkbox"
                    }, {
                        attribute: documentInfo.pdfOptions.useAuthors ? "checked" : undefined,
                        isCheckbox: true,
                        label: "Use authors",
                        labelAfter: true,
                        name: "use-authors",
                        type: "checkbox"
                    }, {
                        attribute: documentInfo.pdfOptions.useDate ? "checked" : undefined,
                        isCheckbox: true,
                        label: "Use date",
                        labelAfter: true,
                        name: "use-date",
                        type: "checkbox"
                    }, {
                        attribute: documentInfo.pdfOptions.paperSize === PdfOptionsPaperSize.A4
                            ? "checked" : undefined,
                        isCheckbox: true,
                        label: "A4 paper",
                        labelAfter: true,
                        name: "a4-paper",
                        type: "checkbox"
                    }, {
                        attribute: documentInfo.pdfOptions.tableOfContents.enabled ? "checked" : undefined,
                        isCheckbox: true,
                        label: "Table of contents",
                        labelAfter: true,
                        name: "table-of-contents",
                        type: "checkbox"
                    }, {
                        label: "Table of contents depth",
                        labelBefore: true,
                        name: "table-of-contents-depth",
                        type: "number",
                        value: documentInfo.pdfOptions.tableOfContents.depth
                    }, {
                        attribute: documentInfo.pdfOptions.pageNumbers === undefined
                            || documentInfo.pdfOptions.pageNumbers ? "checked" : undefined,
                        isCheckbox: true,
                        label: "Page numbers",
                        labelAfter: true,
                        name: "page-numbers",
                        type: "checkbox"
                    }, {
                        label: "Header text",
                        labelBefore: true,
                        name: "header-text",
                        type: "text",
                        value: documentInfo.pdfOptions.header.text
                    }, {
                        label: "Footer text",
                        labelBefore: true,
                        name: "footer-text",
                        type: "text",
                        value: documentInfo.pdfOptions.footer.text
                    }, {
                        attribute: documentInfo.pdfOptions.header.enabled ? "checked" : undefined,
                        isCheckbox: true,
                        label: "Header",
                        labelAfter: true,
                        name: "header",
                        type: "checkbox",
                        value: "???"
                    }, {
                        attribute: documentInfo.pdfOptions.footer.enabled ? "checked" : undefined,
                        isCheckbox: true,
                        label: "Footer",
                        labelAfter: true,
                        name: "footer",
                        type: "checkbox"
                    }, {
                        attribute: documentInfo.pdfOptions.landscape ? "checked" : undefined,
                        isCheckbox: true,
                        label: "Landscape",
                        labelAfter: true,
                        name: "landscape",
                        type: "checkbox"
                    }, {
                        attribute: documentInfo.pdfOptions.twoColumns ? "checked" : undefined,
                        isCheckbox: true,
                        label: "Two columns",
                        labelAfter: true,
                        name: "two-columns",
                        type: "checkbox"
                    }, {
                        attribute: documentInfo.pdfOptions.isPresentation ? "checked" : undefined,
                        isCheckbox: true,
                        label: "Is presentation",
                        labelAfter: true,
                        name: "is-presentation",
                        type: "checkbox"
                    } ];
                    const header = viewRendering.getHeaderDefaults(options, { marktexRenderer: true, sockets: true });
                    header.stylesheets.push({ path: "/stylesheets/document.css" });
                    header.scripts.push({ path: `/scripts/document_bundle.js${options.production ? ".gz" : ""}` });
                    header.title = `${documentInfo.title} by ${JSON.stringify(documentInfo.authors)}`;
                    header.description = `${documentInfo.title} by ${JSON.stringify(documentInfo.authors)} from ${
                        JSON.stringify(documentInfo.date)}`;
                    header.metaValues = [
                        { content: JSON.stringify(accountId), name: "accountId" },
                        { content: `${documentId}`, name: "documentId" }
                    ];
                    const navigationBar = viewRendering.getNavigationBarDefaults(options, { loggedIn });
                    res.render("document", {
                        document: { ... documentInfo, group, members, owner, pdfOptions },
                        header,
                        isOwner: documentInfo.owner === accountId,
                        loggedIn,
                        navigationBar,
                        production: options.production
                    });
                }
            } catch (error) {
                if ((error as Error).message === api.database.account.GeneralError.NO_ACCESS) {
                    return next(createHttpError(403, "Access denied"));
                }
                if ((error as Error).message === api.database.account.GeneralError.NOT_EXISTING) {
                    return next(createHttpError(404, "Account does not exist"));
                }
                if ((error as Error).message === api.database.document.GeneralError.NOT_EXISTING) {
                    return next(createHttpError(404, "Document does not exist"));
                }
                next(createHttpError(404, (error as Error).message));
            }
        });

};
