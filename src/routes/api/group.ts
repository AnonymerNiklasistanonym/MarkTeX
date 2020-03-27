import * as expressSession from "../../middleware/expressSession";
import express from "express";
import { StartExpressServerOptions } from "../../config/express";


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    app.post("/api/account/login", /* auth.getCurrentAccount(), */(req, res) => {
        // TODO: login();
        expressSession.authenticate(req, 1);
        // Redirect to home page
        res.redirect("/");
        // TODO: Edge case when login false do not redirect
    });

    app.post("/api/account/logout", /* auth.getCurrentAccount(), */ (req, res) => {
        // TODO: logout();
        expressSession.removeAuthentication(req);
        // Redirect to home page
        res.redirect("/");
    });
};
