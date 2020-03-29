import * as shell from "shelljs";
import path from "path";


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
shell.mkdir("-p", distDir);

// Copy all the view templates
shell.cp("-R", srcViewsDir, distDir);

// Copy all stylesheets
shell.mkdir("-p", distPublicDir);
shell.cp("-R", srcStylesheetsDir, distPublicDir);

// Copy all favicons
shell.mkdir("-p", distPublicFaviconDir);
shell.cp(path.join(resFaviconDir, "favicon*"), distPublicFaviconDir);

// Copy web app manifest
shell.mkdir("-p", distPublicDir);
shell.cp(srcManifestFile, distManifestFile);
