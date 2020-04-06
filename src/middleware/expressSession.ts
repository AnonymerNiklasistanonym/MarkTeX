import { debuglog } from "util";
import express from "express";
import httpErrors from "http-errors";


const debug = debuglog("app-express-middleware-express-session");


export interface SessionInfo {
    accountId: number
}

export interface AuthenticatedExpressRequestSession {
    session: SessionInfo
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

export const redirectIfAuthenticated = (url = "/") =>
    (req: express.Request, res: express.Response, next: express.NextFunction): void => {
        if (isAuthenticated(req)) {
            return res.redirect(url);
        } else {
            next();
        }
    };

export const checkAuthentication = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (isAuthenticated(req)) {
        debug("User is authenticated");
        next();
    } else {
        debug("User is not authenticated");
        res.locals.explanation = "Authentication does not check out";
        next(httpErrors(401));
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

export const addMessages = (req: express.Request, ... messages: string[]): void => {
    debug(`Add messages: [${messages.join(", ")}]`);
    if (req.session) {
        if (req.session.messages) {
            req.session.messages.push(... messages);
        } else {
            req.session.messages = messages;
        }
    }
};

export const getMessages = (req: express.Request, clearMessages = true): string[] => {
    debug(`Get messages: [${JSON.stringify(req.session ? req.session.messages : "Error")}]`);
    if (req.session && req.session.messages) {
        const messages = req.session.messages;
        if (clearMessages) {
            req.session.messages = [];
        }
        return messages;
    }
    return [];
};
