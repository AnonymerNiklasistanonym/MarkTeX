import * as express from "express";

export const register = (app: express.Application): void => {

    // TODO: const auth = app.locals.authenticator;

    // Home page
    app.get("/testing", (req, res) => {
        console.info("testing"); // eslint-disable-line no-console
        // TODO: Do everything
        res.render("testing", {
            layout: "default",
            header: {
                scripts: [
                    { path: "scripts/testing_bundle.js" },
                    { path: "/socket.io/socket.io.js" }
                ]
            }
        });
    });
};
