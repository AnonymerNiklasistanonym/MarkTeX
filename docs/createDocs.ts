import { Application, TSConfigReader, TypeDocReader, SourceFileMode } from "typedoc";
import { ScriptTarget } from "typescript";
import path from "path";

import { createTypedocReadme } from "./createTypedocReadme";

// First create typedoc README
createTypedocReadme().then(() => {

    const app = new Application();

    // If you want TypeDoc to load tsconfig.json / typedoc.json files
    app.options.addReader(new TSConfigReader());
    app.options.addReader(new TypeDocReader());

    app.bootstrap({
        mode: SourceFileMode.Modules,
        target: ScriptTarget.ESNext,
        experimentalDecorators: true,
        ignoreCompilerErrors: false,
        categorizeByGroup: true,
        exclude: [
            "node_modules/**/*",
            "docs/**/*",
            "dist/**/*",
            "tests/**/*"
        ],
        name: "MarkTeX Modules",
        readme: path.join(__dirname, "dist", "README.md")
    });

    const project = app.convert(app.expandInputFiles(["src"]));

    if (project) {
        // Rendered docs
        const outputDir = path.join(__dirname, "dist", "site");
        app.generateDocs(project, outputDir);
    } else {
        throw Error("TypeDoc documentation was not successful");
    }
});
