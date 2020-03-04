import express, { Request, Response, NextFunction } from "express";
import path from "path";
import exphbs from "express-handlebars";
import createError, { HttpError } from "http-errors";
import { Server } from "http";
import { debuglog } from "util";

import { hbsHelpers } from "./hbs";
import { HbsLayoutError } from "../view_rendering/error";
import { HbsHeader } from "../view_rendering/header";

import * as routesAccount from "../routes/account";
import * as routesTesting from "../routes/testing";
import * as routesHome from "../routes/home";

const debug = debuglog("app-express");

/** Options for express instance */
export interface StartExpressServerOptions {
    /** Name of the database */
    databasePath: string
    /** Indicator if the server should run in production or development mode */
    production: boolean
}

export const startExpressServer = (options: StartExpressServerOptions): Server => {
    // Express setup
    const app = express();
    // Express view engine setup
    const DIR_VIEWS = path.join(__dirname, "..", "views");
    app.set("view engine", "hbs");
    app.set("views", DIR_VIEWS);
    app.engine("hbs", exphbs({
        extname: "hbs",
        defaultLayout: "default",
        layoutsDir: path.join(DIR_VIEWS, "layouts"),
        partialsDir: path.join(DIR_VIEWS, "partials"),
        helpers: hbsHelpers.reduce((map: any, obj) => {
            map[obj.name] = obj.callback;
            // console.log(`Register ${obj.name} as hbs helper`);
            return map;
        }, {})
    }));

    // Cache views for much better performance
    app.set("view cache", true);

    // Catch requests
    app.use((req, res, next) => {
        debug("access resource '%s'", req.originalUrl);
        next();
    });

    // Middleware to server gzip webpack js files
    app.get("*.js.gz", (req, res, next) => {
        debug("*.js.gz file was requested '%s'", req.originalUrl);
        res
            .set("Content-Encoding", "gzip")
            .set("Content-Type", "text/javascript");
        next();
    });

    // Configure static files
    app.use(express.static(path.join(__dirname, "..", "public")));
    app.use("/katex", express.static(path.join(__dirname, "..", "..", "node_modules", "katex", "dist")));
    app.use("/hljs", express.static(path.join(__dirname, "..", "..", "node_modules", "highlight.js", "styles")));

    // Configure routes
    routesAccount.register(app, options);
    routesHome.register(app, options);
    routesTesting.register(app, options);

    // Catch URL not found (404) and forward to error handler
    app.use((req, res, next) => {
        debug("resource was not found '%s'", req.originalUrl);
        res.locals.explanation = `The requested resource (${req.originalUrl}) was not found.`;
        next(createError(404));
    });

    // Page for errors
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
        // set locals, only providing error in development
        const errorRenderContent: HbsLayoutError = {
            error: {
                status: err.status || 500,
                message: err.message,
                stack: err.stack,
                explanation: res.locals.explanation,
                links: [
                    { link: "/", text: "Home" }
                ]
            }
        };
        debug("display error page '%s'", errorRenderContent.error);
        const errorRenderContentHeader: HbsHeader = {
            scripts: [
                { path: "/scripts/error_bundle.js" }
            ],
            stylesheets: [
                { path: "/stylesheets/global.css" },
                { path: "/stylesheets/debug.css" },
                { path: "/stylesheets/error.css" }
            ],
            title: `Error ${err.status || 500}: ${err.message}`,
            favicon: {
                ico: "/favicon/favicon.ico",
                svg: "/favicon/favicon.svg",
                png: {
                    prefix: "/favicon/favicon_",
                    postfix: ".png",
                    sizes: [ 16, 48, 128, 180, 196, 256, 512 ]
                }
            },
            webApp: {
                name: "TypeScript Express Prototype",
                themeColor: "#0289ff",
                manifestPath: "/manifest.json"
            },
            description: "WIP",
            author: "AnonymerNiklasistanonym"
        };
        res
            .status(err.status || 500)
            .render("error", {
                layout: "default",
                ...errorRenderContent,
                header: errorRenderContentHeader
            });
    });

    // Use custom port if defined, otherwise use 8080
    const PORT: number = Number(process.env.SERVER_PORT) || 8080;

    // Start the Express server
    return app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`server started at http://localhost:${PORT}`);
    });
};
