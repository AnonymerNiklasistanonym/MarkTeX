import * as express from "express";
import { StartExpressServerOptions } from "../config/express";
import * as api from "../modules/api";
import * as expressSession from "../middleware/expressSession";

export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // TODO: const auth = app.locals.authenticator;

    // Home page
    app.get("/", (req, res) => {
        // TODO
        res.render("index", {
            layout: "default",
            loggedIn: expressSession.isAuthenticated(req),
            header: {
                scripts: [
                    { path: `/scripts/main_bundle.js${options.production ? ".gz" : ""}` },
                    { path: "/socket.io/socket.io.js" }
                ]
            }
        });
    });

    app.get("/document/:id", async (req, res) => {
        // TODO
        const documentId = Number(req.params.id);
        const documentInfo = await api.database.document.get(options.databasePath, {
            id: documentId,
            getContent: true
        });
        if (documentInfo) {
            const accountInfo = await api.database.account.get(options.databasePath, { id: documentInfo.owner });
            const groupInfo = await api.database.group.get(options.databasePath, { id: documentInfo.group });
            res.render("document", {
                layout: "default",
                document: { ...documentInfo, owner: accountInfo, group: groupInfo },
                header: {
                    scripts: [
                        { path: `/scripts/document_bundle.js${options.production ? ".gz" : ""}` },
                        { path: "/socket.io/socket.io.js" }
                    ],
                    stylesheets: [
                        { path: "/katex/katex.min.css" },
                        { path: "/hljs/default.css" },
                        { path: "/githubmdcss/github-markdown.css" },
                        { path: "/stylesheets/markdown.css" }
                    ]
                }
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
                layout: "default",
                group: { ...groupInfo, documents: groupDocuments, owner: accountInfo },
                header: {
                    scripts: [
                        { path: `/scripts/group_bundle.js${options.production ? ".gz" : ""}` },
                        { path: "/socket.io/socket.io.js" }
                    ]
                }
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
            layout: "default",
            account: { ...accountInfo, documents: accountDocuments, groups: accountGroups },
            header: {
                scripts: [
                    { path: `/scripts/account_bundle.js${options.production ? ".gz" : ""}` },
                    { path: "/socket.io/socket.io.js" }
                ]
            }
        });
    });
};
