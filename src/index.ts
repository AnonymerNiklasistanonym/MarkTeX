import { loadEnvFile } from "./config/env";
import { startExpressServer } from "./config/express";
import { bindSocketServer } from "./config/sockets";

// Check if web server should be started (docker create run image compatibility)
// eslint-disable-next-line no-console
console.log(`DO_NOT_RUN_WEBSERVER=${process.env.DO_NOT_RUN_WEBSERVER}`);
if (process.env.DO_NOT_RUN_WEBSERVER) {
    if (process.env.DO_NOT_RUN_WEBSERVER === "true") {
        process.exit(0);
    }
}

// Load Env File
loadEnvFile();

// Start sever
const server = startExpressServer();

// Bind socket server
bindSocketServer(server);

// Handling terminate gracefully
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received."); // eslint-disable-line no-console
    console.log("Closing Express Server"); // eslint-disable-line no-console
    server.close(() => {
        console.log("Express server closed."); // eslint-disable-line no-console
    });
});
