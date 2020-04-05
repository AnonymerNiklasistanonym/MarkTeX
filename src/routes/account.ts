import * as expressMiddlewareSession from "../middleware/expressSession";
import * as expressMiddlewareValidator from "../middleware/expressValidator";
import * as expressValidator from "express-validator";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import createHttpError from "http-errors";
import express from "express";
import { StartExpressServerOptions } from "../config/express";
import { debug } from "webpack";


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // View logged in account
    app.get("/account", (req, res) => {
        // Show profile if logged in else redirect to login page
        if (expressMiddlewareSession.isAuthenticated(req)) {
            const sessionInfo = expressMiddlewareSession.getSessionInfo(req);
            return res.redirect(`/account/${sessionInfo.accountId}`);
        } else {
            res.redirect("/login");
        }
    });

    // View account
    app.get("/account/:id",
        // Make sure that the account exists
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            id: {
                custom: {
                    options: async (id: number): Promise<boolean> => {
                        const accountExists = await api.database.account.exists(options.databasePath, { id });
                        if (accountExists) { return true; }
                        throw Error(`The account with the id ${id} does not exist`);
                    }
                },
                in: "params",
                isInt: true
            }
        })),
        async (req, res, next) => {
            let accountId: number|undefined;
            const loggedIn = expressMiddlewareSession.isAuthenticated(req);
            if (loggedIn) { accountId =  expressMiddlewareSession.getSessionInfo(req).accountId; }
            const pageAccountId = Number(req.params.id);
            try {
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
                    header.stylesheets.push({ path: "/stylesheets/account.css" });
                    header.metaValues = [{ content: `${accountId}`, name: "accountId" }];
                    const navigationBar = viewRendering.getNavigationBarDefaults(options, { loggedIn });
                    return res.render("account", {
                        account: { ... accountInfo, documents: accountDocuments, groups: accountGroups },
                        header,
                        navigationBar,
                        production: options.production
                    });
                } else {
                    return next(createHttpError(503, `Internal error when getting account info (id=${pageAccountId})`));
                }
            } catch (error) {
                console.warn(error);
                if ((error as Error).message === api.database.account.GeneralError.NO_ACCESS) {
                    return next(createHttpError(403, "Access denied"));
                }
                if ((error as Error).message === api.database.account.GeneralError.NOT_EXISTING) {
                    return next(createHttpError(404, "Account does not exist"));
                }
                next(createHttpError(404, (error as Error).message));
            }
        });

};
