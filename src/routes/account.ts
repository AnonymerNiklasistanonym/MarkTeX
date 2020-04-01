import * as expressMiddlewareSession from "../middleware/expressSession";
import * as expressMiddlewareValidator from "../middleware/expressValidator";
import * as expressValidator from "express-validator";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import createHttpError from "http-errors";
import express from "express";
import { StartExpressServerOptions } from "../config/express";


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
        // Make sure that the account can be accessed
        async (req, res, next) => {
            const sessionInfo = req.session as unknown as expressMiddlewareSession.SessionInfo;
            await expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
                id: {
                    custom: {
                        options: async (id: number): Promise<boolean> => {
                            const accountExists = await api.database.account.exists(
                                options.databasePath, sessionInfo.accountId, { id }
                            );
                            if (accountExists) { return true; }
                            throw Error(`The account with the id ${id} can not be accessed`);
                        }
                    },
                    in: "params",
                    isInt: true
                }
            }))(req, res, next);
        },
        async (req, res, next) => {
            let accountId = 1;
            const loggedIn = expressMiddlewareSession.isAuthenticated(req);
            if (loggedIn) {
                accountId =  expressMiddlewareSession.getSessionInfo(req).accountId;
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
                const navigationBar = viewRendering.getNavigationBarDefaults(options, { loggedIn });
                return res.render("account", {
                    account: { ... accountInfo, documents: accountDocuments, groups: accountGroups },
                    header,
                    navigationBar
                });
            } else {
                next(createHttpError(404, `Account with the ID '${pageAccountId}' was not found`));
            }
        });

};
