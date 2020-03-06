/* eslint-disable no-console */
import * as MarkdownIt from "markdown-it";
import * as katex from "katex";
export { katex };
import "../webpackVars";

export interface Options {
    onError?: (error: Error, originalString: string) => void
};

export interface KatexToHtmlTextOptions {
    /** Set `true` if math should be rendered in displaystyle mode */
    block?: boolean
};

const markDelimiter = "$";
const markDelimiterBlock = "$$";
const markDelimiterEscape = "\\";

export const register = (md: MarkdownIt, options: Options): void =>
{
    const katex2Html = (latex: string, katexToHtmlOptions?: KatexToHtmlTextOptions): string => {
        const katexOptions = {
            displayMode: katexToHtmlOptions !== undefined && katexToHtmlOptions.block,
            // When onError function is defined throw errors
            throwOnError: options.onError !== undefined
        };

        if (DEBUG_APP) {
            console.debug(`MarkdownIt>Plugin>KaTeX>Render: Render LaTeX math string '${latex}'`, katexOptions);
        }

        try {
            return katex.renderToString(latex, katexOptions);
        }
        catch (error) {
            if (options.onError) {
                options.onError(error, latex);
            }
            // if (katexOptions.throwOnError) {
            //     // eslint-disable-next-line no-console
            //     console.error(error);
            // }
            return latex;
        }
    };

    // eslint-disable-next-line complexity
    const mdRuleMathInline: MarkdownIt.RuleInline = (state, silent): boolean => {
        // Current position in token stream
        let posCurrent = state.pos;
        // Check if starting delimiter is found in the current character in token stream
        if (state.src.charAt(posCurrent) !== markDelimiter) {
            return false;
        }
        // Check if starting delimiter is escaped in token stream
        if (state.src.charAt(posCurrent - 1) === markDelimiterEscape) {
            return false;
        }

        // If found remember start position in token stream
        const posStart = posCurrent;
        const posMax = state.posMax;
        // Iterate through token stream to find delimiter a second time/or reach the end
        do {
            posCurrent++;
        } while (
            // Check if the end of the string was reached
            posCurrent < posMax &&
            // Check if the current character is the ending delimiter and if it is not escaped
            (state.src.charAt(posCurrent) !== markDelimiter || state.src.charAt(posCurrent - 1) === markDelimiterEscape)
        );
        const posEnd = posCurrent;

        // Notice if no second delimiter is found
        const secondDelimiterFound = posEnd !== posMax;
        if (!secondDelimiterFound) {
            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>KaTeX>Rule>Inline: No second delimiter found, discard " +
                    `'${state.src.slice(posStart, posEnd + 1)}'`);
            }
            return false;
        }

        // Exit if content is empty
        if (posEnd - posStart === 1) {
            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>KaTeX>Rule>Inline: Empty content, discard " +
                    `'${state.src.slice(posStart, posEnd + 1)}'`);
            }
            return false;
        }

        if (!silent) {
            // If not silent give rules on how to render the token
            // >> Add token for the mark text
            const tokenMarkText = state.push("mathInline", "math", 0);
            tokenMarkText.content = state.src.slice(posStart + 1, secondDelimiterFound ? posEnd : posEnd + 1);

            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>KaTeX>Rule>Inline: Add token to render LaTeX math string " +
                    `'${tokenMarkText.content}'`, state.tokens);
            }
        }
        state.pos = secondDelimiterFound ? posEnd + 1 : posEnd;
        return true;
    };

    // eslint-disable-next-line complexity
    const mdRuleMathInlineBlock: MarkdownIt.RuleInline = (state, silent): boolean => {
        // Current position in token stream
        let posCurrent = state.pos;
        // Check if starting delimiter is found in the current character in token stream
        if (state.src.charAt(posCurrent) !== markDelimiter) {
            return false;
        }
        // If found remember start position in token stream
        const posStart = posCurrent;
        const posMax = state.posMax;
        posCurrent++;

        // Check if second delimiter is found in the current character in token stream
        if (state.src.charAt(posCurrent) !== markDelimiter) {
            return false;
        }

        // Iterate through token stream to find delimiter a second time/or reach the end
        do {
            posCurrent++;
        } while (
            // Check if the end of the string was reached
            posCurrent < posMax &&
            // Check if the current character and the one before are the ending delimiter and if they are escaped
            (state.src.charAt(posCurrent) !== markDelimiter ||
             state.src.charAt(posCurrent - 1) !== markDelimiter ||
             state.src.charAt(posCurrent - 2) === markDelimiterEscape)
        );
        const posEnd = posCurrent;

        // Notice if no second delimiter is found
        const secondDelimiterFound = posEnd !== posMax;
        if (!secondDelimiterFound) {
            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>KaTeX>Rule>InlineBlock: No second delimiter found! " +
                    `'${state.src.slice(posStart, posEnd + 1)}'`);
            }
        }

        // Exit if content is empty
        if (posEnd - posStart === 1) {
            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>KaTeX>Rule>InlineBlock: Empty content, discard " +
                    `'${state.src.slice(posStart, posEnd + 1)}'`);
            }
            return false;
        }

        if (!silent) {
            // If not silent give rules on how to render the token
            // >> Add token for the mark text
            const tokenMarkText = state.push("mathInlineBlock", "math", 0);
            tokenMarkText.content = state.src.slice(posStart + 2, secondDelimiterFound ? posEnd - 1 : posEnd + 1);

            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>KaTeX>Rule>InlineBlock: Add token to render LaTeX math string " +
                    `'${tokenMarkText.content}'`, state.tokens);
            }
        }
        state.pos = secondDelimiterFound ? posEnd + 1 : posEnd;
        return true;
    };

    // eslint-disable-next-line complexity
    const mdRuleMathBlock: MarkdownIt.RuleBlock = (state, startLine, endLine, silent) => {
        const start = startLine;
        const end = endLine;

        let firstLine;
        let lastLine;
        let next;
        let lastPos;
        let found = false;
        let pos = state.bMarks[start] + state.tShift[start];
        let max = state.eMarks[start];


        if(pos + 2 > max){ return false; }
        if(state.src.slice(pos,pos+2)!==markDelimiterBlock){ return false; }

        pos += 2;
        firstLine = state.src.slice(pos,max);

        if(silent){ return true; }
        if(firstLine.trim().endsWith(markDelimiterBlock)){
            // Single line expression
            firstLine = firstLine.trim().slice(0, -2);
            found = true;
        }

        for(next = start; !found; ){

            next++;

            if(next >= end){ break; }

            pos = state.bMarks[next]+state.tShift[next];
            max = state.eMarks[next];

            if(pos < max && state.tShift[next] < state.blkIndent){
                // non-empty line with negative indent should stop the list:
                break;
            }

            if(state.src.slice(pos,max).trim().endsWith(markDelimiterBlock)){
                lastPos = state.src.slice(0,max).lastIndexOf(markDelimiterBlock);
                lastLine = state.src.slice(pos,lastPos);
                found = true;
            }

        }

        state.line = next + 1;

        const token = state.push("mathBlock", "math", 0);
        token.block = true;
        token.content = (firstLine && firstLine.trim() ? firstLine + "\n" : "")
        + state.getLines(start + 1, next, state.tShift[start], true)
        + (lastLine && lastLine.trim() ? lastLine : "");
        token.map = [ start, state.line ];
        token.markup = markDelimiterBlock;
        return true;
    };


    md.inline.ruler.push("mathInline", mdRuleMathInline);
    md.inline.ruler.push("mathInlineBlock", mdRuleMathInlineBlock);
    md.block.ruler.before("paragraph", "mathBlock", mdRuleMathBlock);
    md.renderer.rules.mathInline = (tokens, idx): string => katex2Html(tokens[idx].content);
    md.renderer.rules.mathInlineBlock = (tokens, idx): string => katex2Html(tokens[idx].content, { block: true });
    md.renderer.rules.mathBlock = (tokens, idx): string => katex2Html(tokens[idx].content, { block: true });

    if (DEBUG_APP) {
        console.debug("MarkdownIt>Plugin>KaTeX>Setup: All rules inline ''",
            md.inline.ruler.getRules(""));
        console.debug("MarkdownIt>Plugin>KaTeX>Setup: All rules block ''",
            md.block.ruler.getRules(""));
        console.debug("MarkdownIt>Plugin>KaTeX>Setup: All rules core ''",
            md.core.ruler.getRules(""));
    }

};
