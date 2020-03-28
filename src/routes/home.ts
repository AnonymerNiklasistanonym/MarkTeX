import * as expressSession from "../middleware/expressSession";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import express from "express";
import { StartExpressServerOptions } from "../config/express";


export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // Home page
    app.get("/", (req, res) => {
        // TODO Add more functionality as soon as the user is logged in -> use different handlebars templates
        const header = viewRendering.getHeaderDefaults(options, { sockets: true });
        header.title = "MarkTeX Home";
        header.description = "Home page of MarkTeX";
        header.scripts.push({ path: `/scripts/main_bundle.js${options.production ? ".gz" : ""}` });
        res.render("index", {
            header,
            loggedIn: expressSession.isAuthenticated(req)
        });
    });

};
