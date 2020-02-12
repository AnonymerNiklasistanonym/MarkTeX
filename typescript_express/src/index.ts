import dotenv from "dotenv";
import express from "express";
import path from "path";

// Initialize environment from `.env` file
dotenv.config();

// Use custom port if defined, otherwise use 8080
const port: number = Number(process.env.SERVER_PORT) || 8080;

const app = express();

// Define a route handler for the default home page
app.get("/", (req, res) => {
    res.send("Hello world! :o");
});

// Start the Express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
