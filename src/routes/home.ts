import * as expressSession from "../middleware/expressSession";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import express from "express";
import { StartExpressServerOptions } from "../config/express";


// TODO Externalize later to do the same checks on the server side
const regexAccountName = /^\w{4,16}$/;
const regexAccountPassword = /^.{6,}/;

export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // Home page
    app.get("/", (req, res) => {
        // TODO Add more functionality as soon as the user is logged in -> use different handlebars templates
        const header = viewRendering.getHeaderDefaults(options, { sockets: true });
        header.title = "MarkTeX Home";
        header.description = "Home page of MarkTeX";
        header.stylesheets.push({ path: "/stylesheets/home.css" });
        header.scripts.push({ path: `/scripts/home_bundle.js${options.production ? ".gz" : ""}` });
        res.render("home", {
            header,
            input: {
                accountId: expressSession.isAuthenticated(req) ? expressSession.getSessionInfo(req).accountId : 0,
                accountName: {
                    errorMessage: "The account name must be between 4 and 16 characters",
                    maxLength: 16,
                    pattern: regexAccountName.toString().slice(1, -1)
                },
                accountPassword: {
                    errorMessage: "The password must be at least 6 characters long",
                    minLength: 6,
                    pattern: regexAccountPassword.toString().slice(1, -1)
                }
            },
            loggedIn: expressSession.isAuthenticated(req)
        });
    });

};
