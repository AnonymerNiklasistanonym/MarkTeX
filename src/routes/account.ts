import * as expressSession from "../middleware/expressSession";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import createHttpError from "http-errors";
import express from "express";
import { StartExpressServerOptions } from "../config/express";


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

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
        const accountDocuments = await api.database.document.getAllFromOwner(options.databasePath, accountId, {
            id: pageAccountId
        });
        const accountGroups = await api.database.group.getAllFromOwner(options.databasePath, accountId, {
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
