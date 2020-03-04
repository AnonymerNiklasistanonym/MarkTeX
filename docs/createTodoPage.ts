import fs from "fs";
import path from "path";
import { parse, report } from "leasot";
import glob from "glob";

interface Entry {
    file: string
    tag: string
    line: number
    text: string
}

glob("**/*.{hbs,ts,html,css,yml}", {
    "ignore": [
        "node_modules/**/*",
        "dist/**/*",
        "docs/site/**/*"
    ]
}, (err, files) => {
    if (err) { throw err; }

    /**
     * All found occurences of any source code tags
     */
    const mappedFiles: Entry[] = files
        .map(file => {
            // eslint-disable-next-line no-console
            console.log("Found file: " + file);
            const fileContents = fs.readFileSync(file, "utf8");
            // get the filetype of the file, or force a special parser
            const fileType = path.extname(file);
            // add file for better reporting
            const todoParser = parse(fileContents, {
                extension: fileType,
                filename: file
            });
            return report(todoParser);
        })
        .reduce((a, b) => a.concat(b), []);

    /**
     * Render an entry
     */
    const renderTag = (entry: Entry): string => `| ${entry.tag} | ${entry.text} | ` +
        `${path.extname(entry.file)} | [Link to ${path.basename(entry.file)}](` +
        "https://github.com/AnonymerNiklasistanonym/ProgrammingForMediainformatic" +
        `sWs1819FinalProject/blob/master/SourceCode/${entry.file}#L${entry.line}) |`;

    const todoTags = mappedFiles.filter(a => a.tag === "TODO");
    const fixMeTags = mappedFiles.filter(a => a.tag === "FIXME");
    const otherTags = mappedFiles.filter(a => a.tag !== "FIXME" && a.tag !== "TODO");
    const allTags = [fixMeTags, todoTags, otherTags]
        .reduce((a: string[], b) => a.concat(b.map(renderTag)), []);

    const content = (allTags.length === 0)
        ? "*No open TODO tags found*\n"
        : "| Tag | Description | Type | Link |\n| --- | --- | --- | --- |\n" +
        allTags.join("\n");

    const distDir = path.join(__dirname, "dist");
    if (!fs.existsSync(distDir)){
        fs.mkdirSync(distDir);
    }

    fs.writeFileSync(path.join(distDir, "todos.md"),
        "# Open TODOs\n\n" +
        "In here you can find nearly all currently open FIXME and TODO tags in " +
        "the code:\n\n" + content);
});
