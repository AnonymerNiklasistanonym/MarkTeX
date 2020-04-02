import express from "express";
import { promises as fs } from "fs";
import open from "open";
import path from "path";


const coverageDir = path.join(__dirname, "..", "coverage");

const startStaticCoverageServer = (port = 8082): Promise<string> => new Promise((resolve) => {
    const app = express();
    app.use(express.static(coverageDir));
    app.listen(port, () => {
        const url = `http://localhost:${port}`;
        // eslint-disable-next-line no-console
        console.log(`Server started at ${url}`);
        resolve(url);
    });
});

(async (): Promise<void> => {
    // Check if the documentation directory exists
    try {
        await fs.access(path.join(coverageDir, "index.html"));
    } catch (err) {
        if (err.code === "ENOENT") {
            console.error(`Error: Coverage HTML output was not found (${coverageDir}).`);
        } else {
            console.error(err);
        }
        return process.exit(1);
    }
    const url = await startStaticCoverageServer();
    // Opens the main page of the documentation
    await open(url);
})();
