import * as expressSessionHelper from "../middleware/expressSession";
import * as routesAccount from "../routes/account";
import * as routesApi from "../routes/api";
import * as routesHome from "../routes/home";
import * as routesLogin from "../routes/login";
import * as routesTesting from "../routes/testing";
import * as viewRendering from "../view_rendering/view_rendering";
import bodyParser from "body-parser";
import compression from "compression";
import { debuglog } from "util";
import express from "express";
import expressHandlebars from "express-handlebars";
import expressSession from "express-session";
import { hbsHelpers } from "./hbs";
import { HbsLayoutError } from "../view_rendering/error";
import httpErrors from "http-errors";
import path from "path";
import { Server } from "http";


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
    app.engine("hbs", expressHandlebars({
        defaultLayout: "default",
        extname: "hbs",
        helpers: hbsHelpers.reduce((map: any, obj) => {
            map[obj.name] = obj.callback;
            // console.log(`Register ${obj.name} as hbs helper`);
            return map;
        }, {}),
        layoutsDir: path.join(DIR_VIEWS, "layouts"),
        partialsDir: path.join(DIR_VIEWS, "partials")
    }));

    // Cache views for much better performance
    app.set("view cache", true);

    // Enable easy JSON post requests
    app.use(express.json());

    // Enable form parsing
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // Enable sessions for requests
    app.use(expressSession({
        resave: false,
        saveUninitialized: true,
        secret: "secret"
    }));

    app.use(compression({
        filter: (req: express.Request, res: express.Response) => {
            if (req.headers["x-no-compression"]) {
                // don't compress responses with this request header
                return false;
            }
            // fallback to standard filter function
            return compression.filter(req, res);
        }
    }));

    // Catch requests
    app.use((req, res, next) => {
        debug("access resource '%s' [%s]", req.originalUrl, expressSessionHelper.getSessionDebugString(req));
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
    app.use("/githubmdcss", express.static(path.join(__dirname, "..", "..", "node_modules", "github-markdown-css")));

    // Configure routes
    routesAccount.register(app, options);
    routesApi.register(app, options);
    routesHome.register(app, options);
    routesLogin.register(app, options);
    routesTesting.register(app, options);

    // Catch URL not found (404) and forward to error handler
    app.use((req, res, next) => {
        debug("resource was not found '%s'", req.originalUrl);
        res.locals.explanation = `The requested resource (${req.originalUrl}) was not found.`;
        next(httpErrors(404));
    });

    // Page for errors
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: httpErrors.HttpError, req: express.Request, res: express.Response, next: express.NextFunction) => {
        // set locals, only providing error in development
        const errorRenderContent: HbsLayoutError = {
            error: {
                explanation: res.locals.explanation,
                links: [
                    { link: "/", text: "Home" }
                ],
                message: err.message,
                stack: err.stack,
                status: err.status || 500
            }
        };
        debug("display error page '%s'", errorRenderContent.error);
        const header = viewRendering.getHeaderDefaults(options, { error: true });
        header.description = err.message;
        header.title = `Error ${err.status || 500}: ${err.message}`;
        res
            .status(err.status || 500)
            .render("error", {
                layout: "default",
                ... errorRenderContent,
                header
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
