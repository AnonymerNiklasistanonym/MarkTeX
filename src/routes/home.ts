import * as expressSession from "../middleware/expressSession";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import createHttpError from "http-errors";
import express from "express";
import { StartExpressServerOptions } from "../config/express";


// TODO Externalize later to do the same checks on the server side
const regexAccountName = /^\w{4,16}$/;
const regexAccountPassword = /^.{6,}/;

export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // Home page
    app.get("/", async (req, res, next) => {
        // TODO Add more functionality as soon as the user is logged in -> use different handlebars templates
        const header = viewRendering.getHeaderDefaults(options, { sockets: true });
        header.title = "MarkTeX Home";
        header.description = "Home page of MarkTeX";
        header.stylesheets.push({ path: "/stylesheets/home.css" });
        header.scripts.push({ path: `/scripts/home_bundle.js${options.production ? ".gz" : ""}` });
        const loggedIn = expressSession.isAuthenticated(req);
        if (!loggedIn) {
            return res.render("home", { header, loggedIn });
        }
        const sessioninfo = expressSession.getSessionInfo(req);
        const accountInfo = await api.database.account.get(
            options.databasePath, sessioninfo.accountId, { id: sessioninfo.accountId  }
        );
        const accountDocuments = await api.database.document.getAllFromAuthor(
            options.databasePath, sessioninfo.accountId, { id: sessioninfo.accountId }
        );
        if (!accountInfo || !accountDocuments) {
            return next(createHttpError(500, "Account info or account documents were undefined"));
        }
        res.render("home", {
            account: accountInfo,
            documents: accountDocuments,
            header,
            input: {
                accountId: sessioninfo.accountId,
                accountName: {
                    errorMessage: "The account name must be between 4 and 16 characters",
                    maxLength: 16,
                    pattern: regexAccountName.toString().slice(1, -1),
                    value: accountInfo.name
                },
                accountPassword: {
                    errorMessage: "The password must be at least 6 characters long",
                    minLength: 6,
                    pattern: regexAccountPassword.toString().slice(1, -1)
                }
            },
            loggedIn
        });
    });

};
