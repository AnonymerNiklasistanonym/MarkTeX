import { Express } from "express";
import session from "express-session";


export const register = (app: Express): any => {
    // Configure Express to use authentication sessions
    app.use(session({
        resave: true,
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET || "secret"
    }));

    // TODO
};
