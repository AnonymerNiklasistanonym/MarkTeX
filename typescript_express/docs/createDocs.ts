import { Application, TSConfigReader, TypeDocReader, SourceFileMode } from 'typedoc';
import { ScriptTarget, ModuleKind } from 'typescript';
import path from 'path';

const app = new Application();

// If you want TypeDoc to load tsconfig.json / typedoc.json files
app.options.addReader(new TSConfigReader());
app.options.addReader(new TypeDocReader());

app.bootstrap({
    mode: SourceFileMode.Modules,
    target: ScriptTarget.ES2016,
    module: ModuleKind.CommonJS,
    experimentalDecorators: true,
    ignoreCompilerErrors: false,
    exclude: [
      "node_modules/**/*",
      "docs/**/*",
      "dist/**/*",
      "tests/**/*"
    ],
    name: "Typescript Express Server Modules",
    readme: "./docs/typedocReadme.md"
});

const project = app.convert(app.expandInputFiles(['src']));

if (project) {
    // Rendered docs
    const outputDir = path.join('docs', 'site');
    app.generateDocs(project, outputDir);
} else {
    throw Error("TypeDoc documentation was not successful")
}
