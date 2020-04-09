import routesAccount, { types as account } from "./api/account";
import routesAccountFriend, { types as accountFriend } from "./api/accountFriend";
import routesDocument, { types as document } from "./api/document";
import routesDocumentAccess, { types as documentAccess } from "./api/documentAccess";
import routesDocumentResource, { types as documentResource } from "./api/documentResource";
import routesGroup, { types as group } from "./api/group";
import routesGroupAccess, { types as groupAccess } from "./api/groupAccess";
import routesLatex2svg, { types as latex2svg } from "./api/latex2svg";
import express from "express";
import { StartExpressServerOptions } from "../config/express";

// Export api request/response types
export type {
    account,
    accountFriend,
    document,
    documentAccess,
    documentResource,
    group,
    groupAccess,
    latex2svg
};

// Export all api routes
export default (app: express.Application, options: StartExpressServerOptions): void => {
    routesAccount(app, options);
    routesAccountFriend(app, options);
    routesDocument(app, options);
    routesDocumentAccess(app, options);
    routesDocumentResource(app, options);
    routesGroup(app, options);
    routesGroupAccess(app, options);
    routesLatex2svg(app, options);
};
