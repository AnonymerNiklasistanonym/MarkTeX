import { loadEnvFile } from "./config/env";
import { startExpressServer } from "./config/express";
import { bindSocketServer } from "./config/sockets";
import * as api from "./modules/api";
import { debuglog } from "util";

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
            databasePath
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
    });
