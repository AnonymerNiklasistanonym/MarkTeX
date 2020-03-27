import * as expressSession from "../middleware/expressSession";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import express from "express";
import { StartExpressServerOptions } from "../config/express";


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // TODO: const auth = app.locals.authenticator;

    // Home page
    app.get("/", (req, res) => {
        // TODO
        const header = viewRendering.getHeaderDefaults(options, { sockets: true });
        header.title = "MarkTeX Home";
        header.description = "Home page of MarkTeX";
        header.scripts.push({ path: `/scripts/main_bundle.js${options.production ? ".gz" : ""}` });
        res.render("index", {
            header,
            layout: "default",
            loggedIn: expressSession.isAuthenticated(req)
        });
    });

    app.get("/document/:id", async (req, res) => {
        // TODO
        const documentId = Number(req.params.id);
        const documentInfo = await api.database.document.get(options.databasePath, {
            getContent: true,
            id: documentId
        });
        if (documentInfo) {
            const accountInfo = await api.database.account.get(options.databasePath, { id: documentInfo.owner });
            const groupInfo = await api.database.group.get(options.databasePath, { id: documentInfo.group });
            const header = viewRendering.getHeaderDefaults(options, { marktexRenderer: true, sockets: true });
            header.scripts.push({ path: `/scripts/document_bundle.js${options.production ? ".gz" : ""}` });
            header.title = `${documentInfo.title} by ${documentInfo.authors}`;
            header.description = `${documentInfo.title} by ${documentInfo.authors} from ${documentInfo.date}`;
            res.render("document", {
                document: { ... documentInfo, group: groupInfo, owner: accountInfo },
                header,
                layout: "default"
            });
        }
    });

    app.get("/group/:id", async (req, res) => {
        // TODO
        const groupId = Number(req.params.id);
        const groupInfo = await api.database.group.get(options.databasePath, { id: groupId });
        const groupDocuments = await api.database.document.getAllFromGroup(options.databasePath, { id: groupId });
        if (groupInfo) {
            const accountInfo = await api.database.account.get(options.databasePath, { id: groupInfo.owner });
            res.render("group", {
                group: { ... groupInfo, documents: groupDocuments, owner: accountInfo },
                header: {
                    scripts: [
                        { path: `/scripts/group_bundle.js${options.production ? ".gz" : ""}` },
                        { path: "/socket.io/socket.io.js" }
                    ]
                },
                layout: "default"
            });
        }
    });

    app.get("/account/:id", async (req, res) => {
        // TODO
        const accountId = Number(req.params.id);
        const accountInfo = await api.database.account.get(options.databasePath, { id: accountId });
        const accountDocuments = await api.database.document.getAllFromAuthor(options.databasePath, { id: accountId });
        const accountGroups = await api.database.group.getAllFromAuthor(options.databasePath, { id: accountId });
        res.render("account", {
            account: { ... accountInfo, documents: accountDocuments, groups: accountGroups },
            header: {
                scripts: [
                    { path: `/scripts/account_bundle.js${options.production ? ".gz" : ""}` },
                    { path: "/socket.io/socket.io.js" }
                ]
            },
            layout: "default"
        });
    });
};
