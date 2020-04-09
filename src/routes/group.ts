import * as expressMiddlewareSession from "../middleware/expressSession";
import * as expressMiddlewareValidator from "../middleware/expressValidator";
import * as expressValidator from "express-validator";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import createHttpError from "http-errors";
import express from "express";
import { StartExpressServerOptions } from "../config/express";


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // View group
    app.get("/group/:id",
        // Make sure that the group exists
        expressMiddlewareValidator.validateWithError(expressValidator.checkSchema({
            id: {
                custom: {
                    options: async (id: number): Promise<boolean> => {
                        const documentExists = await api.database.group.exists(
                            options.databasePath, { id }
                        );
                        if (documentExists) { return true; }
                        throw Error(`The group with the id ${id} can not be accessed`);
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
            const groupId = Number(req.params.id);
            try {
                const groupInfo = await api.database.group.get(options.databasePath, accountId, { id: groupId });
                const groupDocuments = await api.database.document.getAllFromGroup(options.databasePath, accountId, {
                    id: groupId
                });
                if (groupInfo) {
                    const accountInfo = await api.database.account.get(
                        options.databasePath, accountId, { id: groupInfo.owner }
                    );
                    const groupMembers = await api.database.group.getMembers(options.databasePath, accountId, {
                        id: groupId
                    });
                    const header = viewRendering.getHeaderDefaults(options, { sockets: true });
                    const navigationBar = viewRendering.getNavigationBarDefaults(options, { loggedIn });
                    header.scripts.push({ path: `/scripts/group_bundle.js${options.production ? ".gz" : ""}` });
                    header.stylesheets.push({ path: "/stylesheets/group.css" });
                    header.metaValues = [{ content: `${accountId}`, name: "accountId" }];
                    res.render("group", {
                        group: { ... groupInfo, documents: groupDocuments, members: groupMembers, owner: accountInfo },
                        header,
                        navigationBar,
                        production: options.production
                    });
                }
            } catch (error) {
                console.warn(error);
                if ((error as Error).message === api.database.group.GeneralError.NO_ACCESS) {
                    return next(createHttpError(403, "Access denied"));
                }
                if ((error as Error).message === api.database.group.GeneralError.NOT_EXISTING) {
                    return next(createHttpError(404, "Group does not exist"));
                }
                next(createHttpError(404, (error as Error).message));
            }
        });

};
