import { defaultDocsOutputDir } from "./createDocs";
import express from "express";
import { promises as fs } from "fs";
import open from "open";


const startStaticDocumentationServer = (port = 8081): Promise<string> => new Promise((resolve) => {
    const app = express();
    app.use(express.static(defaultDocsOutputDir));
    app.listen(port, () => {
        const url = `http://localhost:${port}`;
        // eslint-disable-next-line no-console
        console.log(`Server started at ${url}`);
        resolve(url);
    });
});

interface InternalFsErrorFix extends Error {
    code: string
}

(async (): Promise<void> => {
    // Check if the documentation directory exists
    try {
        await fs.access(defaultDocsOutputDir);
    } catch (err) {
        if ((err as InternalFsErrorFix).code === "ENOENT") {
            throw Error(`Docs output directory was not found (${defaultDocsOutputDir}).`);
        } else {
            throw err;
        }
    }

    try {
        const url = await startStaticDocumentationServer();
        // Opens the main page of the documentation
        await open(url);
    } catch (err) {
        throw err;
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
