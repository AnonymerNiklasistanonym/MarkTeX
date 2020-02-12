import express, { Request, Response, NextFunction } from "express";
import path from "path";
import exphbs from "express-handlebars";
import createError, { HttpError } from "http-errors";

import { hbsHelpers } from "./hbs";
import * as routesAccount from "../routes/account";
import * as routesHome from "../routes/home";

export const startExpressServer = () => {
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
            // tslint:disable-next-line: no-console
            console.log(`Register ${obj.name} as hbs helper`);
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

    // Catch URL not found (404) and forward to error handler
    app.use((req, res, next) => {
        res.locals.explanation = `The requested resource (${req.originalUrl}) was not found.`;
        next(createError(404));
    });

    // Page for errors
    app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
        // set locals, only providing error in development
        res.status(err.status || 500);
        res.render("error", {
            layout: "default",
            error: {
                status: err.status || 500,
                message: err.message,
                stack: err.stack,
                explanation: res.locals.explanation
            },
            header: {
                scripts: [
                    { path: "scripts/test.js" }
                ]
            }
        });
    });

    // Use custom port if defined, otherwise use 8080
    const PORT: number = Number(process.env.SERVER_PORT) || 8080;

    // Start the Express server
    return app.listen(PORT, () => {
        // tslint:disable-next-line:no-console
        console.log(`server started at http://localhost:${PORT}`);
    });
};
