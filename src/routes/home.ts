import * as expressSession from "../middleware/expressSession";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import createHttpError from "http-errors";
import express from "express";
import { StartExpressServerOptions } from "../config/express";


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // Home page
    app.get("/", (req, res) => {
        const header = viewRendering.getHeaderDefaults(options, { sockets: true });
        header.title = "MarkTeX Home";
        header.description = "Home page of MarkTeX";
        header.scripts.push({ path: `/scripts/main_bundle.js${options.production ? ".gz" : ""}` });
        res.render("index", {
            header,
            loggedIn: expressSession.isAuthenticated(req)
        });
    });

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

    // View group
    app.get("/group/:id", async (req, res) => {
        let accountId = 1;
        if (expressSession.isAuthenticated(req)) {
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
            header.scripts.push({ path: `/scripts/group_bundle.js${options.production ? ".gz" : ""}` });
            res.render("group", {
                group: { ... groupInfo, documents: groupDocuments, owner: accountInfo },
                header,
                layout: "default"
            });
        }
    });

    // View logged in account
    app.get("/account", (req, res) => {
        // Show profile if logged in else redirect to login page
        if (expressSession.isAuthenticated(req)) {
            const sessionInfo = expressSession.getSessionInfo(req);
            return res.redirect(`/account/${sessionInfo.accountId}`);
        } else {
            res.redirect("/login");
        }
    });

    // View account
    app.get("/account/:id", async (req, res, next) => {
        let accountId = 1;
        if (expressSession.isAuthenticated(req)) {
            accountId =  expressSession.getSessionInfo(req).accountId;
        }
        const pageAccountId = Number(req.params.id);
        const accountInfo = await api.database.account.get(options.databasePath, accountId, {
            id: pageAccountId
        });
        const accountDocuments = await api.database.document.getAllFromAuthor(options.databasePath, accountId, {
            id: pageAccountId
        });
        const accountGroups = await api.database.group.getAllFromAuthor(options.databasePath, accountId, {
            id: pageAccountId
        });
        if (accountInfo) {
            const header = viewRendering.getHeaderDefaults(options, { sockets: true });
            header.title = `${accountInfo.name}`;
            header.scripts.push({ path: `/scripts/account_bundle.js${options.production ? ".gz" : ""}` });
            return res.render("account", {
                account: { ... accountInfo, documents: accountDocuments, groups: accountGroups },
                header
            });
        } else {
            next(createHttpError(404, `Account with the ID '${pageAccountId}' was not found`));
        }
    });
};
