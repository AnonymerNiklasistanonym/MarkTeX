import * as express from "express";

export const register = (app: express.Application) => {

    // TODO: const auth = app.locals.authenticator;

    // Account page
    app.get("/profile", (req, res) => {
        // tslint:disable-next-line:no-console
        console.info("account");
        // TODO: Render real page
        res.send("account");
    });

    app.get("/login", /* auth.getCurrentAccount(), */(req, res) => {
        // TODO: login();
        // tslint:disable-next-line:no-console
        console.info("login");
        // Redirect to home page
        res.redirect("/");
        // TODO: Edge case when login false do not redirect
    });

    app.get("/logout", /* auth.getCurrentAccount(), */ (req, res) => {
        // TODO: logout();
        // tslint:disable-next-line:no-console
        console.info("logout");
        // Redirect to home page
        res.redirect("/");
    });
};
