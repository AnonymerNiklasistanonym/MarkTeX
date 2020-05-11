import { Application, SourceFileMode, TSConfigReader, TypeDocReader } from "typedoc";
import { createTypedocReadme } from "./createTypedocReadme";
import path from "path";
import { ScriptTarget } from "typescript";


/** The default directory where the documentation is generated */
export const defaultDocsOutputDir = path.join(__dirname, "dist", "site");

// First create typedoc README
(async (): Promise<void> => {
    try {
        await createTypedocReadme();

        const app = new Application();

        // If you want TypeDoc to load tsconfig.json / typedoc.json files
        app.options.addReader(new TSConfigReader());
        app.options.addReader(new TypeDocReader());

        app.bootstrap({
            categorizeByGroup: true,
            exclude: [
                "node_modules/**/*",
                "docs/**/*",
                "dist/**/*",
                "tests/**/*"
            ],
            experimentalDecorators: true,
            ignoreCompilerErrors: false,
            mode: SourceFileMode.Modules,
            name: "MarkTeX Modules",
            readme: path.join(__dirname, "dist", "README.md"),
            target: ScriptTarget.ESNext
        });

        const project = app.convert(app.expandInputFiles(["src"]));

        if (project) {
            app.generateDocs(project, defaultDocsOutputDir);
        } else {
            throw Error("TypeDoc documentation generation was not successful");
        }
    } catch (error) {
        throw error;
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
