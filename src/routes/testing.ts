import * as expressSession from "../middleware/expressSession";
import * as viewRendering from "../view_rendering/view_rendering";
import express from "express";
import { StartExpressServerOptions } from "../config/express";


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // Testing page
    app.get("/testing", (req, res) => {
        let accountId: number|undefined;
        const loggedIn = expressSession.isAuthenticated(req);
        if (loggedIn) { accountId = expressSession.getSessionInfo(req).accountId; }
        const header = viewRendering.getHeaderDefaults(options, { marktexRenderer: true, sockets: true });
        header.stylesheets.push({ path: "/stylesheets/testing.css" });
        header.scripts.push({ path: `/scripts/testing_bundle.js${options.production ? ".gz" : ""}` });
        header.metaValues = [{ content: `${accountId}`, name: "accountId" }];
        const navigationBar = viewRendering.getNavigationBarDefaults(options, { loggedIn });
        res.render("testing", {
            header,
            loggedIn,
            navigationBar
        });
    });
};
