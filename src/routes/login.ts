import * as express from "express";
import * as expressSession from "../middleware/expressSession";

import { StartExpressServerOptions } from "../config/express";


// TODO Externalize later to do the same checks on the server side
const regexAccountName = /^\w{4,16}$/;
const regexAccountPassword = /^.{6,}/;

export const register = (app: express.Application, options: StartExpressServerOptions): void => {

    // Login page
    app.get("/login", (req, res) => {
        // If logged in redirect to home page
        if (expressSession.isAuthenticated(req)) {
            return res.redirect("/");
        }
        // Render login page
        const messages = expressSession.getMessages(req);
        res.render("login", {
            header: {
                scripts: [
                    { path: `/scripts/login_bundle.js${options.production ? ".gz" : ""}` },
                    { path: "/socket.io/socket.io.js" }
                ]
            },
            input: {
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
            layout: "default",
            messages: {
                exist: messages.length > 0,
                texts: messages
            }
        });
    });

};
