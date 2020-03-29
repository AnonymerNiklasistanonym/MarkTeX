import * as expressSession from "../middleware/expressSession";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import express from "express";
import { StartExpressServerOptions } from "../config/express";


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // View document
    // eslint-disable-next-line complexity
    app.get("/document/:id", async (req, res) => {
        let accountId = 1;
        if (expressSession.isAuthenticated(req)) {
            accountId =  expressSession.getSessionInfo(req).accountId;
        }
        const documentId = Number(req.params.id);
        const documentInfo = await api.database.document.get(options.databasePath, accountId, {
            getContent: true,
            getPdfOptions: true,
            id: documentId
        });
        if (documentInfo) {
            const accountInfo = await api.database.account.get(options.databasePath, accountId, {
                id: documentInfo.owner
            });
            const groupInfo = documentInfo.group ? await api.database.group.get(options.databasePath, accountId, {
                id: documentInfo.group
            }) : undefined;
            if (!documentInfo.pdfOptions) { documentInfo.pdfOptions = {}; }
            if (!documentInfo.pdfOptions.tableOfContents) { documentInfo.pdfOptions.tableOfContents = {}; }
            if (!documentInfo.pdfOptions.header) { documentInfo.pdfOptions.header = {}; }
            if (!documentInfo.pdfOptions.footer) { documentInfo.pdfOptions.footer = {}; }
            const pdfOptions: viewRendering.pdfOptions.PdfOption[] = [ {
                attribute: documentInfo.pdfOptions.useTitle ? "checked" : undefined,
                label: "Use title",
                labelAfter: true,
                name: "use-title",
                type: "checkbox"
            }, {
                attribute: documentInfo.pdfOptions.useAuthors ? "checked" : undefined,
                label: "Use authors",
                labelAfter: true,
                name: "use-authors",
                type: "checkbox"
            }, {
                attribute: documentInfo.pdfOptions.useDate ? "checked" : undefined,
                label: "Use date",
                labelAfter: true,
                name: "use-date",
                type: "checkbox"
            }, {
                attribute: documentInfo.pdfOptions.paperSize === api.database.document.PdfOptionsPaperSize.A4
                    ? "checked" : undefined,
                label: "A4 paper",
                labelAfter: true,
                name: "a4-paper",
                type: "checkbox"
            }, {
                attribute: documentInfo.pdfOptions.tableOfContents.enabled ? "checked" : undefined,
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
                attribute: documentInfo.pdfOptions.pageNumbers === undefined || documentInfo.pdfOptions.pageNumbers
                    ? "checked" : undefined,
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
                label: "Header",
                labelAfter: true,
                name: "header",
                type: "checkbox",
                value: "???"
            }, {
                attribute: documentInfo.pdfOptions.footer.enabled ? "checked" : undefined,
                label: "Footer",
                labelAfter: true,
                name: "footer",
                type: "checkbox"
            }, {
                attribute: documentInfo.pdfOptions.isPresentation ? "checked" : undefined,
                label: "Is presentation",
                labelAfter: true,
                name: "is-presentation",
                type: "checkbox"
            } ];
            const header = viewRendering.getHeaderDefaults(options, { marktexRenderer: true, sockets: true });
            header.scripts.push({ path: `/scripts/document_bundle.js${options.production ? ".gz" : ""}` });
            header.title = `${documentInfo.title} by ${documentInfo.authors}`;
            header.description = `${documentInfo.title} by ${documentInfo.authors} from ${documentInfo.date}`;
            res.render("document", {
                document: { ... documentInfo, group: groupInfo, owner: accountInfo, pdfOptions },
                header
            });
        }
    });

};
