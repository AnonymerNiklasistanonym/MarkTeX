import * as express from "express";
import { StartExpressServerOptions } from "../config/express";

export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // TODO: const auth = app.locals.authenticator;

    // Home page
    app.get("/testing", (req, res) => {
        // TODO: Do everything
        res.render("testing", {
            layout: "default",
            header: {
                scripts: [
                    { path: "/scripts/testing_bundle.js.gz" },
                    { path: "/socket.io/socket.io.js" }
                ],
                stylesheets: [
                    { path: "/katex/katex.min.css" },
                    { path: "/hljs/default.css" },
                    { path: "/stylesheets/testing.css" }
                ]
            }
        });
    });
};
