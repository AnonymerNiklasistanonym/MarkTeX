import * as express from "express";
import { StartExpressServerOptions } from "../config/express";

export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // TODO: const auth = app.locals.authenticator;

    // Home page
    app.get("/", (req, res) => {
        // TODO: Do everything
        res.render("index", {
            layout: "default",
            header: {
                scripts: [
                    { path: "scripts/main_bundle.js" },
                    { path: "/socket.io/socket.io.js" }
                ]
            }
        });
    });
};
