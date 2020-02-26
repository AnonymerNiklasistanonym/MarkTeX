import * as express from "express";

export const register = (app: express.Application): void => {

    // TODO: const auth = app.locals.authenticator;

    // Account page
    app.get("/profile", (req, res) => {
        console.info("account"); // eslint-disable-line no-console
        // TODO: Render real page
        res.send("account");
    });

    app.get("/login", /* auth.getCurrentAccount(), */(req, res) => {
        // TODO: login();
        console.info("login"); // eslint-disable-line no-console
        // Redirect to home page
        res.redirect("/");
        // TODO: Edge case when login false do not redirect
    });

    app.get("/logout", /* auth.getCurrentAccount(), */ (req, res) => {
        // TODO: logout();
        console.info("logout"); // eslint-disable-line no-console
        // Redirect to home page
        res.redirect("/");
    });
};
