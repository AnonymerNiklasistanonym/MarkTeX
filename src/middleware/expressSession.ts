import * as express from "express";
import createError from "http-errors";
import { debuglog } from "util";

const debug = debuglog("app-express-middleware-express-session");


export interface SessionInfo {
    accountId: number
}

export const getSessionInfo = (req: express.Request): SessionInfo => {
    if (req.session) {
        return {
            accountId: req.session.accountId
        };
    }
    throw Error("Session information was undefined");
};

export const getSessionDebugString = (req: express.Request): string => {
    if (req.session) {
        let sessionString = `session=${req.sessionID}`;
        if (req.session.accountId) {
            sessionString += `,accountId=${req.session.accountId}`;
        }
        return sessionString;
    }
    return "Error: Session was undefined";
};

export const authenticate = (req: express.Request, accountId: number): void => {
    if (req.session) {
        req.session.accountId = accountId;
    }
};

export const removeAuthentication = (req: express.Request): void => {
    if (req.session) {
        req.session.accountId = undefined;
    }
};

export const isAuthenticated = (req: express.Request): boolean => req.session && req.session.accountId;

export const checkAuthentication = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (isAuthenticated(req)) {
        debug("User is authenticated");
        next();
    } else {
        debug("User is not authenticated");
        res.locals.explanation = "Authentication does not check out";
        next(createError(401));
    }
};

export const checkAuthenticationJson = (req: express.Request, res: express.Response,
    next: express.NextFunction): void => {
    if (isAuthenticated(req)) {
        debug("User is authenticated");
        next();
    } else {
        debug("User is not authenticated");
        res.status(401).json({ error: "Authentication does not check out" });
    }
};
