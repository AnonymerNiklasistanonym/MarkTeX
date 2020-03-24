/* eslint-disable no-console */
import * as MarkdownIt from "markdown-it";
import "../webpackVars";

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/34842797#34842797
// eslint-disable-next-line no-bitwise
const hashCode = (s: string): number => s.split("").reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0);

export const register = (md: MarkdownIt): void => {
    // eslint-disable-next-line complexity
    const mdRuleLatexBlock: MarkdownIt.RuleBlock = (state, startLine, endLine, silent) => {

        let currentLine = startLine;
        let posBeginCurrentLine = state.bMarks[currentLine] + state.tShift[currentLine];
        let posEndCurrentLine = state.eMarks[currentLine];
        let currentString = state.src.slice(posBeginCurrentLine,posEndCurrentLine);

        // Check if the first line starts with a \begin{
        if (!currentString.startsWith("\\begin{center}")) { return false; }

        if (DEBUG_APP) {
            console.debug("MarkdownIt>Plugin>Latex: BEGIN block found");
        }

        let latexString = currentString;
        const headerIncludesString = "% header-includes: ";
        let headerIncludes: string[] = [];

        do {

            // Check if the first line ends with a \end{
            currentLine++;
            posBeginCurrentLine = state.bMarks[currentLine] + state.tShift[currentLine];
            posEndCurrentLine = state.eMarks[currentLine];
            currentString = state.src.slice(posBeginCurrentLine,posEndCurrentLine);
            state.line++;

            if (currentString.startsWith(headerIncludesString)) {
                currentString = currentString.slice(headerIncludesString.length ,currentString.length);
                headerIncludes = currentString.split(" ").filter(a => a.length !== 0);
                if (DEBUG_APP) {
                    console.debug("MarkdownIt>Plugin>Latex: Found header includes", headerIncludes);
                }
                continue;
            } else {
                latexString += `\n${currentString}`;
            }

        } while (!currentString.startsWith("\\end{center}") && currentLine <= endLine);

        if (currentLine > endLine) {
            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>Latex: END block not found");
            }
            return false;
        }

        if (DEBUG_APP) {
            console.debug(`MarkdownIt>Plugin>Latex: END block found '${latexString}'`);
        }

        const token = state.push("latexBlock", "latex", 0);
        token.block = true;
        token.content = latexString;
        token.meta = { headerIncludes };
        token.map = [ startLine, state.line ];
        token.markup = "\\begin{center}\\end{center}";

        state.line++;
        return true;
    };

    const latex2html = (latexString: string, headerIncludes: string[]): string => {
        // Generate hash for given string
        const latexStringHash = hashCode(latexString);

        if (DEBUG_APP) {
            console.debug(`MarkdownIt>Plugin>Latex>Renderer: Render '${latexString}' `
                          + `with the header includes: '${headerIncludes}'`);
        }
        return `<div class="markdown-latex-block" id="${latexStringHash}" `
               + `header-includes="${headerIncludes.join(",")}">`
               + `<p>${latexString}</p>`
               + "<svg class=\"loading\"><text x=\"10\" y=\"20\" style=\"fill:red;\">Currently Loading</text></svg>"
               + "</div>";
    };


    md.block.ruler.before("paragraph", "latexBlock", mdRuleLatexBlock);
    md.renderer.rules.latexBlock = (tokens, idx): string => latex2html(tokens[idx].content,
        tokens[idx].meta.headerIncludes);
};
