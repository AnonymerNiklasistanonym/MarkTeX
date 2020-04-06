import * as expressMiddlewareSession from "../middleware/expressSession";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import createHttpError from "http-errors";
import express from "express";
import { StartExpressServerOptions } from "../config/express";


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // Home page
    app.get("/", async (req, res, next) => {
        const loggedIn = expressMiddlewareSession.isAuthenticated(req);
        const header = viewRendering.getHeaderDefaults(options, { sockets: true });
        header.title = "MarkTeX Home";
        header.description = "Home page of MarkTeX";
        header.stylesheets.push({ path: "/stylesheets/home.css" });
        header.scripts.push({ path: `/scripts/home_bundle.js${options.production ? ".gz" : ""}` });
        const navigationBar = viewRendering.getNavigationBarDefaults(options, { loggedIn });
        if (!loggedIn) {
            return res.render("home", { header, loggedIn, navigationBar, production: options.production });
        }
        const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
        header.metaValues = [{ content: `${sessionInfo.accountId}`, name: "accountId" }];
        const accountInfo = await api.database.account.get(
            options.databasePath, sessionInfo.accountId, { id: sessionInfo.accountId  }
        );
        const accountDocuments = await api.database.document.getAllFromOwner(
            options.databasePath, sessionInfo.accountId, { id: sessionInfo.accountId }
        );
        const accountFriends = await api.database.accountFriend.getAllFromAccount(
            options.databasePath, sessionInfo.accountId, { getNames: true, id: sessionInfo.accountId }
        );
        const accountGroups = await api.database.group.getAllFromOwner(
            options.databasePath, sessionInfo.accountId, { id: sessionInfo.accountId }
        );
        if (!accountInfo || !accountDocuments) {
            return next(createHttpError(500, "Account info or account documents were undefined"));
        }
        res.render("home", {
            account: accountInfo,
            documents: accountDocuments,
            friends: accountFriends,
            groups: accountGroups,
            header,
            input: {
                accountId: sessionInfo.accountId,
                accountName: {
                    errorMessage: api.database.account.createInfoUsername.info,
                    maxLength: api.database.account.createInfoUsername.maxLength,
                    pattern: api.database.account.createInfoUsername.regex.toString().slice(1, -1),
                    value: accountInfo.name
                },
                accountPassword: {
                    errorMessage: api.database.account.createInfoPassword.info,
                    minLength: api.database.account.createInfoPassword.minLength,
                    pattern: api.database.account.createInfoPassword.regex.toString().slice(1, -1)
                }
            },
            loggedIn,
            navigationBar,
            production: options.production
        });
    });

};
