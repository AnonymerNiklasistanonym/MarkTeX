import express, { Request, Response, NextFunction } from "express";
import path from "path";
import exphbs from "express-handlebars";
import createError, { HttpError } from "http-errors";
import { Server } from "http";

import { hbsHelpers, HbsHeader, HbsLayoutError } from "./hbs";
import * as routesAccount from "../routes/account";
import * as routesTesting from "../routes/testing";
import * as routesHome from "../routes/home";

export const startExpressServer = (): Server => {
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

    // Configure static files
    app.use(express.static(path.join(__dirname, "..", "public")));

    // Configure routes
    routesAccount.register(app);
    routesHome.register(app);
    routesTesting.register(app);

    // Catch URL not found (404) and forward to error handler
    app.use((req, res, next) => {
        // eslint-disable-next-line no-console
        console.log(`Resource was not found (${req.originalUrl})`);
        res.locals.explanation = `The requested resource (${req.originalUrl}) was not found.`;
        next(createError(404));
    });

    // Page for errors
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
        // set locals, only providing error in development
        res.status(err.status || 500);
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
        const errorRenderContentHeader: HbsHeader = {
            scripts: [
                { path: "scripts/error_bundle.js" }
            ],
            stylesheets: [
                { path: "stylesheets/global.css" },
                { path: "stylesheets/error.css" }
            ],
            title: `Error ${err.status || 500}: ${err.message}`,
            favicon: {
                ico: "TODO.ico",
                svg: "TODO.svg",
                png: {
                    prefix: "TODO_",
                    postfix: ".png",
                    sizes: [ 128, 256 ]
                }
            },
            webApp: {
                name: "TODO",
                themeColor: "#0289ff",
                manifestPath: "TODO.json"
            },
            description: "WIP",
            author: "AnonymerNiklasistanonym"
        };
        res.render("error", {
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
