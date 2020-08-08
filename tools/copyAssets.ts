import * as shell from "shelljs";
import { promises as fs } from "fs";
import path from "path";


(async (): Promise<void> => {

    const distDir = path.join(__dirname, "..", "dist");
    const distPublicDir = path.join(distDir, "public");
    const distManifestFile = path.join(distPublicDir, "manifest.json");
    const distPublicFaviconDir = path.join(distPublicDir, "favicon");

    const srcDir = path.join(__dirname, "..", "src");
    const srcViewsDir = path.join(srcDir, "views");
    const srcStylesheetsDir = path.join(srcDir, "public", "stylesheets");
    const srcManifestFile = path.join(srcDir, "public", "manifest.json");

    const resDir = path.join(__dirname, "..", "res");
    const resFaviconDir = path.join(resDir, "favicon");

    // Create distribution directories if non existing
    await fs.mkdir(distDir, { recursive: true });

    // Copy all the view templates
    shell.cp("-R", srcViewsDir, distDir);

    // Copy all stylesheets
    await fs.mkdir(distPublicDir, { recursive: true });
    shell.cp("-R", srcStylesheetsDir, distPublicDir);

    // Copy all favicons
    await fs.mkdir(distPublicFaviconDir, { recursive: true });
    shell.cp(path.join(resFaviconDir, "favicon*"), distPublicFaviconDir);

    // Copy web app manifest
    await fs.mkdir(distPublicDir, { recursive: true });
    await fs.copyFile(srcManifestFile, distManifestFile);

})().catch(error => {
    console.error(error);
    process.exit(1);
});
