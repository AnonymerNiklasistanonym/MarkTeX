import { Application, TSConfigReader, TypeDocReader, SourceFileMode } from "typedoc";
import { ScriptTarget } from "typescript";
import path from "path";

import { createTypedocReadme } from "./createTypedocReadme";

/** The default directory where the documentation is generated */
export const defaultDocsOutputDir = path.join(__dirname, "dist", "site");

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
        app.generateDocs(project, defaultDocsOutputDir);
    } else {
        throw Error("TypeDoc documentation was not successful");
    }
});
