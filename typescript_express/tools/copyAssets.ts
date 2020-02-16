import * as shell from "shelljs";

// Create distribution directories if non existing
shell.mkdir("-p", "dist/");

// Copy all the view templates
shell.cp("-R", "src/views", "dist/");

// Copy all stylesheets
shell.mkdir("-p", "dist/public");
shell.cp("-R", "src/public/stylesheets", "dist/public");
