import * as shell from "shelljs";
import path from "path";

// Remove all built files
shell.rm("-rf",
    path.join(__dirname, "..", "dist"),
    path.join(__dirname, "..", "docs", "dist"),
    path.join(__dirname, "..", "docker", "dist")
);
