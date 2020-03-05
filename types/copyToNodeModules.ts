import * as shell from "shelljs";
import path from "path";

// Create basic directories to insert types (if not already existing)
const nodeModulesDir = path.join(__dirname, "..", "node_modules");
const nodeModulesTypesDir = path.join(nodeModulesDir, "@types");
shell.mkdir("-p",
    nodeModulesDir,
    nodeModulesTypesDir
);

// Copy/Replace markdown-it types
const typesMarkdownItDir = path.join(__dirname, "markdown-it");
const nodeModulesTypesMarkdownItDir = path.join(nodeModulesTypesDir, "markdown-it");
shell.rm("-rf",
    nodeModulesTypesMarkdownItDir
);
shell.cp("-R",
    typesMarkdownItDir,
    nodeModulesTypesDir
);
