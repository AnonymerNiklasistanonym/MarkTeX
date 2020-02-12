import * as express from "express";

export const register = (app: express.Application) => {

    // TODO: const auth = app.locals.authenticator;

    // Home page
    app.get("/", (req, res) => {
        // tslint:disable-next-line:no-console
        console.info("home");
        // TODO: Do everything
        res.render("index", {});
    });
};
