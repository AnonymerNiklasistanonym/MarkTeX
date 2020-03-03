/* eslint-disable no-console */
import * as MarkdownIt from "markdown-it";
import * as katex from "katex";
export { katex };

const markDelimiter = "$";

export const register = (md: MarkdownIt): void =>
{
    const katexToHtmlText = (latex: string, displayMode = false): string => {
        const options = { displayMode, throwOnError: true };
        try{
            return katex.renderToString(latex, options);
        }
        catch(error){
            if(options.throwOnError){
                // eslint-disable-next-line no-console
                console.error(error);
            }
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
    const mdRuleMathInline: MarkdownIt.RuleInline = (state, silent): boolean => {
        // Current position in token stream
        let posCurrent = state.pos;
        // Check if delimiter is found in the current character in token stream
        if (state.src.charAt(posCurrent) !== markDelimiter) {
            return false;
        }

        // If found remember start position in token stream
        const posStart = posCurrent;
        const posMax = state.posMax;
        // Iterate through token stream to find delimiter a second time/or reach the end
        do {
            posCurrent++;
        } while (posCurrent < posMax && state.src.charAt(posCurrent) !== markDelimiter);
        const posEnd = posCurrent;

        // Exit if no second delimiter is found
        if (posEnd === posMax) {
            console.debug("No second delimiter found: ", state.src.slice(posStart, posEnd + 1));
            return false;
        }

        // Exit if content is empty
        if (posEnd - posStart === 1) {
            console.debug("Empty content, abort", state.src.slice(posStart, posEnd + 1));
            return false;
        }

        if (!silent) {
            // If not silent give rules on how to render the token
            // >> Add token for the mark text
            const tokenMarkText = state.push("mathInline", "", 0);
            tokenMarkText.content = state.src.slice(posStart + 1, posEnd);

            console.debug("MdMarkPlugin: Added tokens: ", {
                final: tokenMarkText.content,
                original: state.src.slice(posStart, posEnd + 1)
            }, state.tokens);
        }
        state.pos = posEnd;
        return true;
    };

    // eslint-disable-next-line complexity
    const mdRuleMathBlock: MarkdownIt.RuleBlock = (state, silent): boolean => {
        // Current position in token stream
        let posCurrent = state.pos;
        // Check if delimiter is found in the current character in token stream
        if (state.src.charAt(posCurrent) !== markDelimiter
            || state.src.charAt(posCurrent + 1) !== markDelimiter) {
            return false;
        }

        // If found remember start position in token stream
        const posStart = posCurrent;
        const posMax = state.posMax;
        // Iterate through token stream to find delimiter a second time/or reach the end
        do {
            posCurrent++;
        } while (posCurrent < posMax && state.src.charAt(posCurrent) !== markDelimiter);
        const posEnd = posCurrent;

        // Exit if no second delimiter is found
        if (posEnd === posMax) {
            console.debug("No second delimiter found: ", state.src.slice(posStart, posEnd + 1));
            return false;
        }

        // Exit if content is empty
        if (posEnd - posStart === 1) {
            console.debug("Empty content, abort", state.src.slice(posStart, posEnd + 1));
            return false;
        }

        if (!silent) {
            // If not silent give rules on how to render the token
            // >> Add token for the mark text
            const tokenMarkText = state.push("mathInline", "", 0);
            tokenMarkText.content = state.src.slice(posStart + 1, posEnd);

            console.debug("MdMarkPlugin: Added tokens: ", {
                final: tokenMarkText.content,
                original: state.src.slice(posStart, posEnd + 1)
            }, state.tokens);
        }
        state.pos = posEnd + 1;
        return true;
    };


    md.inline.ruler.push(
        "mathInline", // name of added rule
        mdRuleMathInline  // rule function
    );
    md.block.ruler.push(
        "mathInline", // name of added rule
        mdRuleMathBlock  // rule function
    );
    md.renderer.rules.mathInline = katexInlineRenderer;
    md.renderer.rules.mathBlock = katexBlockRenderer;

};
