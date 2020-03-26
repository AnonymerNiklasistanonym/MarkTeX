import * as express from "express";
import { StartExpressServerOptions } from "../config/express";
import * as expressSession from "../middleware/expressSession";

export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // TODO: const auth = app.locals.authenticator;

    // Account page
    app.get("/profile", expressSession.checkAuthentication, (req, res) => {
        // TODO: Render real page
        res.send(`account ${req.session ? req.session.accountId : "Error"}`);
    });

    // app.get("/login", /* auth.getCurrentAccount(), */(req, res) => {
    //     // TODO: login();
    //     expressSession.authenticate(req, 1);
    //     // Redirect to home page
    //     res.redirect("/");
    //     // TODO: Edge case when login false do not redirect
    // });

    app.get("/logout", /* auth.getCurrentAccount(), */ (req, res) => {
        // TODO: logout();
        expressSession.removeAuthentication(req);
        // Redirect to home page
        res.redirect("/");
    });
};
