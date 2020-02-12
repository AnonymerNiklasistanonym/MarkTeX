
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { Server } from "http";
import exphbs from "express-handlebars";

import * as routesAccount from "../routes/account";
import * as routesHome from "../routes/home";

export const startExpressServer = (): Server => {
    // Express setup
    const app = express();
    // Express view engine setup
    app.set('view engine', 'hbs');
    app.engine('hbs', exphbs({
        extname: 'hbs',
        layoutsDir: path.join(__dirname, '/views/pages/'),
        partialsDir: path.join(__dirname, '/views/partials/')
    }));

    // Configure routes
    routesAccount.register(app);
    routesHome.register(app);

    // Use custom port if defined, otherwise use 8080
    const PORT: number = Number(process.env.SERVER_PORT) || 8080;

    // Start the Express server
    return app.listen(PORT, () => {
        // tslint:disable-next-line:no-console
        console.log(`server started at http://localhost:${PORT}`);
    });
}
