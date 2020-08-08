import { promises as fs } from "fs";
import path from "path";

(async (): Promise<void> => {

    // Remove all built files
    await fs.rmdir(path.join(__dirname, "..", "dist"));
    await fs.rmdir(path.join(__dirname, "..", "docs", "dist"));
    await fs.rmdir(path.join(__dirname, "..", "docker", "dist"));

})().catch(error => {
    console.error(error);
    process.exit(1);
});
