import * as expressSession from "../middleware/expressSession";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import express from "express";
import { StartExpressServerOptions } from "../config/express";


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // View document
    app.get("/document/:id", async (req, res) => {
        let accountId = 1;
        if (expressSession.isAuthenticated(req)) {
            accountId =  expressSession.getSessionInfo(req).accountId;
        }
        const documentId = Number(req.params.id);
        const documentInfo = await api.database.document.get(options.databasePath, accountId, {
            getContent: true,
            id: documentId
        });
        if (documentInfo) {
            const accountInfo = await api.database.account.get(options.databasePath, accountId, {
                id: documentInfo.owner
            });
            const groupInfo = await api.database.group.get(options.databasePath, accountId, {
                id: documentInfo.group
            });
            const header = viewRendering.getHeaderDefaults(options, { marktexRenderer: true, sockets: true });
            header.scripts.push({ path: `/scripts/document_bundle.js${options.production ? ".gz" : ""}` });
            header.title = `${documentInfo.title} by ${documentInfo.authors}`;
            header.description = `${documentInfo.title} by ${documentInfo.authors} from ${documentInfo.date}`;
            res.render("document", {
                document: { ... documentInfo, group: groupInfo, owner: accountInfo },
                header
            });
        }
    });

};
