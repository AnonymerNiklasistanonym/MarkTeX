import * as account from "./api/account";
import * as accountFriend from "./api/accountFriend";
import * as document from "./api/document";
import * as group from "./api/group";
import * as latex2svg from "./api/latex2svg";
import express from "express";
import { StartExpressServerOptions } from "../config/express";

export type {
    account,
    accountFriend,
    document,
    group,
    latex2svg
};


export const register = (app: express.Application, options: StartExpressServerOptions): void => {
    latex2svg.register(app, options);
    document.register(app, options);
    account.register(app, options);
    accountFriend.register(app, options);
    group.register(app, options);
};
