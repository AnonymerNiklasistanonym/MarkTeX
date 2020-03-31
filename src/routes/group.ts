import * as expressSession from "../middleware/expressSession";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import express from "express";
import { StartExpressServerOptions } from "../config/express";


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // View group
    app.get("/group/:id", async (req, res) => {
        let accountId = 1;
        const loggedIn = expressSession.isAuthenticated(req);
        if (loggedIn) {
            accountId =  expressSession.getSessionInfo(req).accountId;
        }
        const groupId = Number(req.params.id);
        const groupInfo = await api.database.group.get(options.databasePath, accountId, { id: groupId });
        const groupDocuments = await api.database.document.getAllFromGroup(options.databasePath, accountId, {
            id: groupId
        });
        if (groupInfo) {
            const accountInfo = await api.database.account.get(options.databasePath, accountId, {
                id: groupInfo.owner
            });
            const header = viewRendering.getHeaderDefaults(options, { sockets: true });
            const navigationBar = viewRendering.getNavigationBarDefaults(options, { loggedIn });
            header.scripts.push({ path: `/scripts/group_bundle.js${options.production ? ".gz" : ""}` });
            res.render("group", {
                group: { ... groupInfo, documents: groupDocuments, owner: accountInfo },
                header,
                navigationBar
            });
        }
    });

};
