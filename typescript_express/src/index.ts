import { loadEnvFile } from "./config/env";
import { startExpressServer } from "./config/express";

// Load Env File
loadEnvFile();

// Start sever
const server = startExpressServer();

// Handling terminate gracefully
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received."); // tslint:disable-line
    console.log("Closing Express Server"); // tslint:disable-line
    server.close(() => {
        console.log("Express server closed."); // tslint:disable-line
    });
});
