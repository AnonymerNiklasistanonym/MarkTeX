/* eslint-disable no-console */
import * as MarkdownIt from "markdown-it";
import * as katex from "katex";
export { katex };
import "../webpackVars";

export interface Options {
    onError?: (error: Error, originalString: string) => void
};

const markDelimiter = "$";
const markDelimiterBlock = "$$";
const markDelimiterEscape = "\\";

export const register = (md: MarkdownIt, options: Options): void =>
{
    const katexToHtmlText = (latex: string, displayMode = false): string => {
        const katexOptions = {
            displayMode,
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

    const katexInlineRenderer = (tokens: { content: string }[], idx: number): string => {
        return katexToHtmlText(tokens[idx].content, false);
    };

    const katexBlockRenderer = (tokens: { content: string }[], idx: number): string => {
        return katexToHtmlText(tokens[idx].content, true);
    };

    // eslint-disable-next-line complexity
    const mdRuleMathInlineDisplaysyle: MarkdownIt.RuleInline = (state, silent): boolean => {
        // Current position in token stream
        let posCurrent = state.pos;
        const posMax = state.posMax;
        // Check if starting delimiter is found in the current character in token stream
        if ((state.src.charAt(posCurrent) !== markDelimiter)
            || (posCurrent + 1 < posMax && state.src.charAt(posCurrent + 1) !== markDelimiter)) {
            return false;
        }

        // If found remember start position in token stream
        const posStart = posCurrent;
        posCurrent++;
        // Iterate through token stream to find delimiter a second time/or reach the end
        do {
            posCurrent++;
        } while (
            // Check if the end of the string was reached
            posCurrent < posMax &&
            // Check if the current character is the ending delimiter and if it is not escaped
            (state.src.charAt(posCurrent) !== markDelimiter ||
             state.src.charAt(posCurrent - 1) !== markDelimiter ||
             state.src.charAt(posCurrent - 2) === markDelimiterEscape)
        );
        const posEnd = posCurrent;

        // Exit if no second delimiter is found
        if (posEnd === posMax) {
            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>KaTeX>Rule>InlineDisplaystyle: No second delimiter found, discard " +
                    `'${state.src.slice(posStart, posEnd + 1)}'`);
            }
            return false;
        }

        // Exit if content is empty
        if (posEnd - posStart === 1) {
            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>KaTeX>Rule>InlineDisplaystyle: Empty content, discard " +
                    `'${state.src.slice(posStart, posEnd + 1)}'`);
            }
            return false;
        }

        if (!silent) {
            // If not silent give rules on how to render the token
            // >> Add token for the mark text
            const tokenMarkText = state.push("mathInlineDisplaystyle", "", 0);
            tokenMarkText.content = state.src.slice(posStart + 2, posEnd - 1);

            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>KaTeX>Rule>mathInlineDisplaystyle: Add token to render LaTeX math " +
                     "string " + `'${tokenMarkText.content}'`, state.tokens);
            }
        }
        state.pos = posEnd + 1;
        return true;
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

        // Exit if no second delimiter is found
        if (posEnd === posMax) {
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
            const tokenMarkText = state.push("mathInline", "", 0);
            tokenMarkText.content = state.src.slice(posStart + 1, posEnd);

            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>KaTeX>Rule>Inline: Add token to render LaTeX math string " +
                    `'${tokenMarkText.content}'`, state.tokens);
            }
        }
        state.pos = posEnd + 1;
        return true;
    };

    // eslint-disable-next-line complexity
    const mdRuleMathBlock: MarkdownIt.RuleBlock = (state, startLine, endLine, silent) => {
        let posCurrent = state.bMarks[startLine] + state.tShift[startLine];
        const posMax = state.eMarks[endLine];

        if (DEBUG_APP) {
            console.debug("MarkdownIt>Plugin>KaTeX>Rule>Block: I am executed");
        }

        // Check if the end of the string is reached
        if (posCurrent + 1 > posMax) { return false; }

        if (DEBUG_APP) {
            console.debug("MarkdownIt>Plugin>KaTeX>Rule>Block: Length for delimiter is OK");
        }

        // Check if the delimiter is found
        const delimiterBegin = state.src.charAt(posCurrent) + state.src.charAt(posCurrent + 1);
        if (DEBUG_APP) {
            console.debug(`MarkdownIt>Plugin>KaTeX>Rule>Block: delimiterBegin: '${delimiterBegin}'`);
        }
        if (delimiterBegin !== markDelimiterBlock) {
            return false;
        }

        if (DEBUG_APP) {
            console.debug("MarkdownIt>Plugin>KaTeX>Rule>Block: Delimiter was found");
        }

        // If found remember start position in token stream
        const posStart = posCurrent;
        posCurrent++;

        // Iterate through token stream to find delimiter a second time/or reach the end
        do {
            posCurrent++;
            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>KaTeX>Rule>Block: DELETE", {
                    posCurrent, posMax,
                    "state.src.charAt(posCurrent - 2)": state.src.charAt(posCurrent - 2),
                    "state.src.charAt(posCurrent - 1)": state.src.charAt(posCurrent - 1),
                    "state.src.charAt(posCurrent)": state.src.charAt(posCurrent),
                    final: ((state.src.charAt(posCurrent - 1) !== markDelimiter
                    || state.src.charAt(posCurrent) !== markDelimiter)
                    || state.src.charAt(posCurrent - 2) === markDelimiterEscape)
                });
            }
        } while (
            // Check if the end of the string was reached
            posCurrent < posMax &&
            // Check if the current character is the ending delimiter and if it is not escaped
            ((state.src.charAt(posCurrent - 1) !== markDelimiter || state.src.charAt(posCurrent) !== markDelimiter)
             || state.src.charAt(posCurrent - 2) === markDelimiterEscape)
        );
        const posEnd = posCurrent;
        const markup = state.src.slice(posStart + 2, posEnd - 2);

        // Exit if no second delimiter is found
        if (posEnd === posMax) {
            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>KaTeX>Rule>Block: End of string was reached but no delimiter found");
            }
            return false;
        }

        // Since start is found, we can report success here in validation mode
        if (silent) { return true; }

        // search end of block
        const nextLine = startLine;

        // If a fence has heading spaces, they should be removed from its inner block
        const len = state.sCount[startLine];

        state.line = nextLine + state.getLines(startLine + 1, nextLine, posEnd - posStart, true);

        const tokenMarkText = state.push("mathBlock", "", 0);
        tokenMarkText.content = state.src.slice(posStart + 2, posEnd - 2);
        tokenMarkText.content = state.getLines(startLine + 1, nextLine, len, true);
        tokenMarkText.markup  = markup;
        tokenMarkText.map     = [ startLine, state.line ];

        return true;
    };


    md.inline.ruler.push(
        "mathInlineDisplaystyle", // name of added rule
        mdRuleMathInlineDisplaysyle  // rule function
    );
    md.inline.ruler.push(
        "mathInline", // name of added rule
        mdRuleMathInline  // rule function
    );
    md.block.ruler.before(
        "paragraph",
        "mathBlock", // name of added rule
        mdRuleMathBlock // rule function
    );
    md.renderer.rules.mathInline = katexInlineRenderer;
    md.renderer.rules.mathInlineDisplaystyle = katexBlockRenderer;
    md.renderer.rules.mathBlock = katexBlockRenderer;

    if (DEBUG_APP) {
        console.debug("MarkdownIt>Plugin>KaTeX>Setup: All rules inline ''",
            md.inline.ruler.getRules(""));
        console.debug("MarkdownIt>Plugin>KaTeX>Setup: All rules block ''",
            md.block.ruler.getRules(""));
        console.debug("MarkdownIt>Plugin>KaTeX>Setup: All rules core ''",
            md.core.ruler.getRules(""));
    }

};
