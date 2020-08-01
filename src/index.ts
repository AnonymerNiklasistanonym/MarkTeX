/* eslint-disable no-console */
import * as inkscape from "./modules/inkscape";
import * as latex from "./modules/latex";
import * as pandoc from "./modules/pandoc";
import { bindSocketServer, SocketRequestInfo } from "./config/sockets";
import { findHttp2Keys, startExpressServerHttp1, startExpressServerHttp2 } from "./config/express";
import api from "./modules/api";
import { debuglog } from "util";
import expressSession from "express-session";
import { Server as HttpServer } from "http";
import { loadEnvFile } from "./config/env";
import os from "os";
import path from "path";


// Debug console
const debug = debuglog("app");

// Version
const marktexVersion = "1.0.1";

// Read command line arguments
let ignoreWarnings = false;
const cliArgs = process.argv.slice(2);
debug(`Command line arguments: ${cliArgs.join(",")}`);
const helpOptions = [
    { option: "--help                     ", text: "Usage info" },
    { option: "--version                  ", text: "Version info" },
    { option: "--ignoreWarnings           ", text: "Ignore warnings about connected programs that would stop the app" }
];
const envVariables = [
    { option: "SERVER_PORT=8080           ", text: "Set server port of marktex server" },
    { option: "DATABASE_PATH=~/database.db", text: "Set database path of marktex" },
    { option: "NODE_DEBUG=app*            ", text: "Get debug logs for certain parts regarding the server backend" }
];
for (const arg of cliArgs) {
    if (arg === "--help") {
        // Display help
        console.log(
            "marktex [OPTIONS]" +
            "\n\n" +
            "Optional options:\n" + helpOptions.map(a => `\t${a.option}  ${a.text}`).join("\n") +
            "\n\n" +
            "Optional environment variables:\n" + envVariables.map(a => `\t${a.option}  ${a.text}`).join("\n")
        );
        process.exit(0);
    } else if (arg === "--version") {
        // Display version
        console.log(marktexVersion);
        process.exit(0);
    }  else if (arg === "--ignoreWarnings") {
        ignoreWarnings = true;
    } else {
        // Display error
        console.error(`Unknown command line option: "${arg}"`);
        process.exit(0);
    }
}

// Load Env File
loadEnvFile();

// Check if special path to database is requested
const databasePath = process.env.DATABASE_PATH && process.env.DATABASE_PATH !== ""
    ? process.env.DATABASE_PATH : path.join(__dirname, "..", "database.db");


(async (): Promise<void> => {
    try {
        // Load database
        const databaseExists = await api.database.exists(databasePath);
        if (databaseExists) {
            debug(`database was found (${databasePath})`);
        } else {
            debug(`setup database as it does not exist (${databasePath})`);
            await api.database.create(databasePath);
        }

        // Start express sever
        const sessionMiddleware = expressSession({
            resave: false,
            saveUninitialized: true,
            secret: "secret"
        });
        // Start http2 server if keys are found
        const startServer = findHttp2Keys() ? startExpressServerHttp2 : startExpressServerHttp1;
        const server = startServer({
            databasePath,
            production: process.env.NODE_ENV !== "development"
        }, { sessionMiddleware });

        // Bind socket server to express server
        const socketServer = bindSocketServer(server as unknown as HttpServer, {
            sessionMiddleware: (socket, next) => {
                const socketRequest = socket.request as SocketRequestInfo;
                sessionMiddleware(socket.request, socketRequest.res, next);
            },
            socketOptions: {
                getAccountName: async (accountId?: number): Promise<string|undefined> => {
                    if (accountId === undefined) {
                        return undefined;
                    }
                    const get = await api.database.account.get(databasePath, accountId, { id: accountId });
                    if (get) {
                        return get.name;
                    }
                }
            }
        });

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

        // Get program version
        let errorWasThrown = false;
        try {
            const version = await inkscape.getVersion();
            console.log(`inkscape: ${version.major}.${version.minor}.${version.patch} (${version.date.toISOString()})`);
        } catch (error) {
            console.error(error);
            errorWasThrown = true;
        }
        try {
            const version = await pandoc.getVersion();
            console.log(`pandoc:   ${version.major}.${version.minor}.${version.patch}`);
        } catch (error) {
            console.error(error);
            errorWasThrown = true;
        }
        try {
            const version = await latex.getVersion();
            console.log(`latex:    ${version.major}.${version.minor} (${version.engine})`);
        } catch (error) {
            console.error(error);
            errorWasThrown = true;
        }

        console.log(`node:     ${process.versions.node}`);
        console.log(`os:       ${os.platform()} [${os.release()}] (${os.arch()})`);

        if (!ignoreWarnings && errorWasThrown) {
            throw Error("Quit program because at least one essential command line program was not found");
        }

    } catch (error) {
        throw error;
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
