import { loadEnvFile } from "./config/env";
import { startExpressServer } from "./config/express";
import { bindSocketServer } from "./config/sockets";
import * as api from "./modules/api";
import * as inkscape from "./modules/inkscape";
import * as pandoc from "./modules/pandoc";
import * as latex from "./modules/latex";
import { debuglog } from "util";
import { exit } from "shelljs";

const debug = debuglog("app");

// Load Env File
loadEnvFile();

// Load database
const databasePath = "./database.db";
api.database.checkIfDatabaseExists(databasePath)
    .then(exists => {
        // Setup database if non is found
        if (!exists) {
            debug("setup database='%s' as it does not exist", databasePath);
            return api.setupDatabase();
        } else {
            debug("database found");
        }
    })
    .then(() => {
        // Start sever
        const server = startExpressServer({
            databasePath,
            production: process.env.NODE_ENV !== "development"
        });
        debug("server was started");

        // Bind socket server
        const socketServer = bindSocketServer(server);
        debug("socket server was bound to server");

        // Handling terminate gracefully
        process.on("SIGTERM", () => {
            debug("SIGTERM signal was received");
            server.close(() => {
                debug("server was closed");
            });
            socketServer.close(() => {
                debug("socket server was closed");
            });
        });
    })
    .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
        exit(1);
    })
    .then(() => inkscape.getVersion()).then(version => {
        // eslint-disable-next-line no-console
        console.log(`inkscape: ${version.major}.${version.minor}.${version.patch} (${version.date.toISOString()})`);
    })
    .then(() => pandoc.getVersion()).then(version => {
        // eslint-disable-next-line no-console
        console.log(`pandoc:   ${version.major}.${version.minor}.${version.patch}`);
    })
    .then(() => latex.getVersion()).then(version => {
        // eslint-disable-next-line no-console
        console.log(`latex:    ${version.major}.${version.minor} (${version.engine})`);
    })
    .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
        exit(1);
    });
