import { loadEnvFile } from "./config/env";
import { startExpressServer } from "./config/express";

// Load Env File
loadEnvFile();

// Start sever
const server = startExpressServer();

// Handling terminate gracefully
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received."); // eslint-disable-line no-console
    console.log("Closing Express Server"); // eslint-disable-line no-console
    server.close(() => {
        console.log("Express server closed."); // eslint-disable-line no-console
    });
});
