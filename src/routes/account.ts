import * as express from "express";
import { StartExpressServerOptions } from "../config/express";

export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // TODO: const auth = app.locals.authenticator;

    // Account page
    app.get("/profile", (req, res) => {
        // TODO: Render real page
        if (req.session && req.session.accountId) {
            res.send(`account ${req.session.accountId}`);
        } else {
            res.send("no account");
        }
    });

    app.get("/login", /* auth.getCurrentAccount(), */(req, res) => {
        // TODO: login();
        if (req.session) {
            req.session.accountId = 1;
        }
        // Redirect to home page
        res.redirect("/");
        // TODO: Edge case when login false do not redirect
    });

    app.get("/logout", /* auth.getCurrentAccount(), */ (req, res) => {
        // TODO: logout();
        // Redirect to home page
        res.redirect("/");
    });
};
