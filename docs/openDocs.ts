import { defaultDocsOutputDir } from "./createDocs";
import { promises as fs } from "fs";
import open from "open";
import path from "path";


(async (): Promise<void> => {
    // Check if the documentation directory exists
    try {
        await fs.access(defaultDocsOutputDir);
    } catch (err) {
        if (err.code === "ENOENT") {
            // eslint-disable-next-line no-console
            console.error(`Error: Docs output directory was not found (${defaultDocsOutputDir}).`);
        } else {
            // eslint-disable-next-line no-console
            console.error(err);
        }
        return process.exit(1);
    }
    // Opens the main page of the documentation
    await open(path.join(defaultDocsOutputDir, "index.html"));
})();
