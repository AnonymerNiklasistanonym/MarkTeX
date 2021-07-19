import { debuglog } from "util";
import express from "express";
import httpErrors from "http-errors";


const debug = debuglog("app-express-middleware-express-session");


export interface SessionInfo {
    accountId?: number
    messages?: string[]
}

export interface SessionInfoAuthenticated {
    accountId: number
}

export interface AuthenticatedExpressRequestSession {
    session: SessionInfo
}

export const getSessionInfo = (req: express.Request): SessionInfo => {
    if (req.session) {
        const requestSession = req.session as SessionInfo;
        if (requestSession.accountId) {
            return {
                accountId: requestSession.accountId
            };
        }
        throw Error("Session information did not contain the account id");
    }
    throw Error("Session information was undefined");
};

export const getSessionInfoAuthenticated = (req: express.Request): SessionInfoAuthenticated => {
    if (req.session) {
        const requestSession = req.session as unknown as SessionInfoAuthenticated;
        return {
            accountId: requestSession.accountId
        };
    }
    throw Error("Session information was undefined");
};

export const getSessionDebugString = (req: express.Request): string => {
    if (req.session) {
        const requestSession = req.session as SessionInfo;
        let sessionString = `session=${JSON.stringify(req.sessionID)}`;
        if (requestSession.accountId) {
            sessionString += `,accountId=${requestSession.accountId}`;
        }
        return sessionString;
    }
    return "Error: Session was undefined";
};

export const authenticate = (req: express.Request, accountId: number): void => {
    if (req.session) {
        const requestSession = req.session as SessionInfo;
        requestSession.accountId = accountId;
    }
};

export const removeAuthentication = (req: express.Request): void => {
    if (req.session) {
        const requestSession = req.session as SessionInfo;
        requestSession.accountId = undefined;
    }
};

export const isAuthenticated = (req: express.Request): boolean =>
    req.session !== undefined && (req.session as SessionInfo).accountId !== undefined;

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
        const reqSession = req.session as SessionInfo;
        if (reqSession.messages) {
            reqSession.messages.push(... messages);
        } else {
            reqSession.messages = messages;
        }
    }
};

export const getMessages = (req: express.Request, clearMessages = true): string[] => {
    debug(`Get messages: [${JSON.stringify(req.session ? (req.session as SessionInfo).messages : "Error")}]`);
    if (req.session) {
        const reqSession = req.session as SessionInfo;
        if (reqSession.messages) {
            // Copy messages by value before clearing them from the session
            const messages = reqSession.messages.slice();
            if (clearMessages) {
                reqSession.messages = [];
            }
            return messages;
        }
    }
    return [];
};
