import * as expressMiddlewareSession from "../middleware/expressSession";
import * as expressMiddlewareValidator from "../middleware/expressValidator";
import * as expressValidator from "express-validator";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import createHttpError from "http-errors";
import { debuglog } from "util";
import express from "express";
import { StartExpressServerOptions } from "../config/express";


export interface LoginRequest {
    name: string
    password: string
}
export interface RegisterRequest {
    name: string
    password: string
}


const debug = debuglog("app-express-route-account");


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
                const accountFriends = await api.database.accountFriend.getAllFromAccount(
                    options.databasePath, accountId, { getNames: true, id: pageAccountId }
                );
                if (accountInfo) {
                    const header = viewRendering.getHeaderDefaults(options, { sockets: true });
                    header.title = `${accountInfo.name}`;
                    header.scripts.push({ path: `/scripts/account_bundle.js${options.production ? ".gz" : ""}` });
                    header.stylesheets.push({ path: "/stylesheets/account.css" });
                    header.metaValues = [{ content: `${accountId}`, name: "accountId" }];
                    const navigationBar = viewRendering.getNavigationBarDefaults(options, { loggedIn });
                    res.render("account", {
                        account: {
                            ... accountInfo,
                            documents: accountDocuments,
                            friends: accountFriends,
                            groups: accountGroups
                        },
                        header,
                        navigationBar,
                        production: options.production
                    });
                } else {
                    next(createHttpError(503, `Internal error when getting account info (id=${pageAccountId})`));
                }
            } catch (error) {
                if (!options.production) { console.error(error); }
                if ((error as Error).message === api.database.account.GeneralError.NO_ACCESS) {
                    return next(createHttpError(403, "Access denied"));
                }
                if ((error as Error).message === api.database.account.GeneralError.NOT_EXISTING) {
                    return next(createHttpError(404, "Account does not exist"));
                }
                next(createHttpError(404, (error as Error).message));
            }
        });

    app.post("/account_register",
        // Validate api input
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            name: { isString: true },
            password: { isString: true }
        })),
        // Redirect to home page if already authenticated
        expressMiddlewareSession.redirectIfAuthenticated(),
        // Try to register user
        async (req, res) => {
            debug(`Register: ${JSON.stringify(req.body)}`);
            const request = req.body as RegisterRequest;
            try {
                const accountId = await api.database.account.create(options.databasePath, request);
                expressMiddlewareSession.authenticate(req, accountId);
                res.redirect("/");
            } catch (error) {
                // Check for specific create account errors
                if ((error as Error).message === api.database.account.CreateError.USER_NAME_ALREADY_EXISTS) {
                    expressMiddlewareSession.addMessages(req, `The user name '${request.name}' already exists`);
                } else if ((error as Error).message === api.database.account.CreateError.PASSWORD_INVALID_FORMAT) {
                    expressMiddlewareSession.addMessages(req,
                        `The password format is invalid (${api.database.account.createInfoPassword.info})`
                    );
                }  else if ((error as Error).message === api.database.account.CreateError.USER_NAME_INVALID_FORMAT) {
                    expressMiddlewareSession.addMessages(req,
                        `The user name format is invalid (${api.database.account.createInfoUsername.info})`
                    );
                } else {
                    if (!options.production) { console.error(error); }
                    expressMiddlewareSession.addMessages(req, (error as Error).message);
                }
                res.redirect("/login");
            }
        });

    app.post("/account_login",
        // Validate api input
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            name: { isString: true },
            password: { isString: true }
        })),
        // Redirect to home page if already authenticated
        expressMiddlewareSession.redirectIfAuthenticated(),
        // Try to login user
        async (req, res) => {
            debug(`Login: ${JSON.stringify(req.body)}`);
            const request = req.body as LoginRequest;
            try {
                const accountId = await api.database.account.checkLogin(options.databasePath, request);
                // If login was successful authenticate user and redirect to home page
                if (accountId) {
                    expressMiddlewareSession.authenticate(req, accountId);
                    return res.redirect("/");
                }
                // If login was not successful redirect back to login
                throw Error("Login was not successful");
            } catch (error) {
                if ((error as Error).message === api.database.account.GeneralError.NOT_EXISTING) {
                    expressMiddlewareSession.addMessages(req, `Account ${request.name} does not exist`);
                } else {
                    if (!options.production) { console.error(error); }
                    expressMiddlewareSession.addMessages(req, (error as Error).message);
                }
                // On any error redirect to login page
                res.redirect("/login");
            }
        });
};
