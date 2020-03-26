import * as express from "express";
import { StartExpressServerOptions } from "../config/express";

import * as latex2svg from "./api/latex2svg";
import * as document from "./api/document";
import * as group from "./api/group";
import * as account from "./api/account";

export type { latex2svg };
export type { account };
export type { document };
export type { group };

export const register = (app: express.Application, options: StartExpressServerOptions): void => {
    latex2svg.register(app, options);
    document.register(app, options);
    account.register(app, options);
    group.register(app, options);
};
