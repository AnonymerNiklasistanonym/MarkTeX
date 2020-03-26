/* eslint-disable no-console */
import * as MarkdownIt from "markdown-it";
import "../webpackVars";
import * as apiRequests from "../apiRequests";


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

// eslint-disable-next-line complexity
export const renderLatexBlocks = (): void => {
    // Update latex blocks
    const latexBlocks: NodeListOf<HTMLDivElement> = document.querySelectorAll("div.markdown-latex-block");
    const timeOfRequest = new Date().toISOString();
    for (const latexBlock of latexBlocks) {
        // Make requests to get svg data from latex blocks
        const headerIncludeString = latexBlock.getAttribute("header-includes");
        const latexHeaderIncludes =
            (headerIncludeString !== undefined && headerIncludeString !== null)
                ? headerIncludeString.split(",") : [];
        const texContentElement = latexBlock.querySelector("p");
        if (texContentElement === undefined || texContentElement == null
            || texContentElement.textContent === undefined || texContentElement.textContent === null) {
            // eslint-disable-next-line no-console
            console.log("latex block has no tex content");
            return;
        }
        if (DEBUG_APP) {
            // eslint-disable-next-line no-console
            console.debug("Testing: MarkdownIt found a latex block: ", {
                id: latexBlock.id,
                content: texContentElement.textContent,
                latexHeaderIncludes
            });
        }
        apiRequests.latex2Svg.latex2Svg({
            latexStringHash: latexBlock.id,
            latexString: texContentElement.textContent,
            latexHeaderIncludes,
            timeOfRequest
        })
            // eslint-disable-next-line complexity
            .then(response => {
                // eslint-disable-next-line no-console
                console.log(`Received a response: response=${JSON.stringify(response)}`);
                if (latexBlock === undefined || latexBlock === null) {
                    // eslint-disable-next-line no-console
                    console.log("latex block is undefined");
                    return;
                }
                if (latexBlock.id !== String(response.id)) {
                    // eslint-disable-next-line no-console
                    console.log("latex block has different ID to response");
                    return;
                }
                const svgElement = latexBlock.querySelector("svg");
                if (svgElement === undefined || svgElement === null) {
                    // eslint-disable-next-line no-console
                    console.log("svg element is undefined");
                    return;
                }
                svgElement.classList.remove("loading");
                svgElement.innerHTML = response.svgData;
                const svgChild = svgElement.querySelector("svg");
                if (svgChild) {
                    svgElement.innerHTML = svgChild.innerHTML;
                }
            })
            .catch(error => {
                // eslint-disable-next-line no-console
                console.error(`svg data could not be retrieved: ${JSON.stringify(error)}`);
            });
    }
};
