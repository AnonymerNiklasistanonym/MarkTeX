import * as shell from "shelljs";

// Create distribution directories if non existing
shell.mkdir("-p", "dist/");

// Copy all the view templates
shell.cp("-R", "src/views", "dist/");

// Copy all stylesheets
shell.mkdir("-p", "dist/public");
shell.cp("-R", "src/public/stylesheets", "dist/public");

// Copy all favicons
shell.mkdir("-p", "dist/public/favicon");
shell.cp("res/favicon/favicon*", "dist/public/favicon");

// Copy web app manifest
shell.mkdir("-p", "dist/public");
shell.cp("src/public/manifest.json", "dist/public/manifest.json");
