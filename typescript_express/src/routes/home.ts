import * as express from "express";

export const register = (app: express.Application): void => {

    // TODO: const auth = app.locals.authenticator;

    // Home page
    app.get("/", (req, res) => {
        console.info("home"); // eslint-disable-line no-console
        // TODO: Do everything
        res.render("index", {});
    });
};
