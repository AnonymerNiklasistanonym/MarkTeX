import * as inkscape from "./modules/inkscape";
import * as latex from "./modules/latex";
import * as pandoc from "./modules/pandoc";
import { findHttp2Keys, startExpressServerHttp1, startExpressServerHttp2 } from "./config/express";
import api from "./modules/api";
import { bindSocketServer } from "./config/sockets";
import { debuglog } from "util";
import expressSession from "express-session";
import { loadEnvFile } from "./config/env";
import os from "os";
import path from "path";

// Debug console
const debug = debuglog("app");

// Load Env File
loadEnvFile();

// Check if special path to database is requested
const databasePath = process.env.DATABASE_PATH && process.env.DATABASE_PATH !== ""
    ? process.env.DATABASE_PATH : path.join(__dirname, "..", "database.db");

// Load database
api.database.exists(databasePath)
    .then(async exists => {
        // Setup database if non is found
        if (!exists) {
            debug("setup database '%s' as it does not exist", databasePath);
            await api.database.create(databasePath);
        } else {
            debug("database '%s' found", databasePath);
        }
    })
    .then(() => {
        const sessionMiddleware = expressSession({
            resave: false,
            saveUninitialized: true,
            secret: "secret"
        });
        // Start sever (start http2 server if keys are found)
        const startServer = findHttp2Keys() ? startExpressServerHttp2 : startExpressServerHttp1;
        const server = startServer({
            databasePath,
            production: process.env.NODE_ENV !== "development"
        }, { sessionMiddleware });
        debug("server was started");

        // Bind socket server
        const socketServer = bindSocketServer(server, {
            sessionMiddleware: (socket, next) => { sessionMiddleware(socket.request, socket.request.res, next); },
            socketOptions: {
                getAccountName: async (accountId: number): Promise<string|undefined> => {
                    const get = await api.database.account.get(databasePath, accountId, { id: accountId });
                    if (get) {
                        return get.name;
                    }
                }
            }
        });
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
        process.exit(1);
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
    .then(() => {
        // eslint-disable-next-line no-console
        console.log(`node:     ${process.versions.node}`);
        // eslint-disable-next-line no-console
        console.log(`os:       ${os.platform()} [${os.release()}] (${os.arch()})`);
    })
    .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
        process.exit(1);
    });
