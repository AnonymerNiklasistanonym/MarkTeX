import * as expressSession from "../middleware/expressSession";
import * as viewRendering from "../view_rendering/view_rendering";
import api from "../modules/api";
import express from "express";
import { StartExpressServerOptions } from "../config/express";


// Export login/register routes
export default (app: express.Application, options: StartExpressServerOptions): void => {

    // Login page
    app.get("/login", (req, res) => {
        // If logged in redirect to home page
        if (expressSession.isAuthenticated(req)) {
            return res.redirect("/");
        }
        // Render login page
        const header = viewRendering.getHeaderDefaults(options, { sockets: true });
        header.stylesheets.push({ path: "/stylesheets/login.css" });
        header.scripts.push({ path: `/scripts/login_bundle.js${options.production ? ".gz" : ""}` });
        header.title = "MarkTeX Login & Register";
        const navigationBar = viewRendering.getNavigationBarDefaults(options);
        const messages = expressSession.getMessages(req);
        res.render("login", {
            header,
            input: {
                accountName: {
                    errorMessage: api.database.account.createInfoUsername.info,
                    maxLength: api.database.account.createInfoUsername.maxLength,
                    pattern: api.database.account.createInfoUsername.regex.toString().slice(1, -1)
                },
                accountPassword: {
                    errorMessage: api.database.account.createInfoPassword.info,
                    minLength: api.database.account.createInfoPassword.minLength,
                    pattern: api.database.account.createInfoPassword.regex.toString().slice(1, -1)
                }
            },
            layout: "default",
            messages: {
                exist: messages.length > 0,
                texts: messages
            },
            navigationBar,
            production: options.production
        });
    });

    // Logout route
    app.get("/logout", (req, res) => {
        expressSession.removeAuthentication(req);
        // Redirect to home page
        res.redirect("/");
    });

};
