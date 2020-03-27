import * as viewRendering from "../view_rendering/view_rendering";
import express from "express";
import { StartExpressServerOptions } from "../config/express";

export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // TODO: const auth = app.locals.authenticator;

    // Home page
    app.get("/testing", (req, res) => {
        // TODO: Do everything
        const header = viewRendering.getHeaderDefaults(options, { marktexRenderer: true, sockets: true });
        header.stylesheets.push({ path: "/stylesheets/testing.css" });
        header.scripts.push({ path: `/scripts/testing_bundle.js${options.production ? ".gz" : ""}` });

        res.render("testing", {
            header,
            layout: "default"
        });
    });
};
