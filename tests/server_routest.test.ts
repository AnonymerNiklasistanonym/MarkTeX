import * as expressApp from "../src/config/express";
import chai from "chai";
import chaiHttp from "chai-http";
import expressSession from "express-session";
import os from "os";
import path from "path";
import serverRoutesApiAccount from "./server_routes/api_account";
import serverRoutesApiGroup from "./server_routes/api_group";
import serverRoutesBrowser from "./server_routes/browser";


const databasePath = path.join(os.tmpdir(), "test_server.db");

const sessionMiddleware = expressSession({
    resave: false,
    saveUninitialized: true,
    secret: "secret"
});

const APP = expressApp.getExpressServer({ databasePath, production: true }, { sessionMiddleware });

chai.use(chaiHttp);
chai.should();

describe("server routes", () => {
    serverRoutesBrowser(databasePath, APP);

    describe("api", () => {
        serverRoutesApiAccount(databasePath, APP);
        serverRoutesApiGroup(databasePath, APP);
    });
});
