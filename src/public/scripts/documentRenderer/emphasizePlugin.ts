/* eslint-disable no-console */
import * as MarkdownIt from "markdown-it";

// Source: https://gist.github.com/m93a/cedc4aae4d875f73305f841e919c857b

const markDelimiter = "=";

export const register = (md: MarkdownIt): void => {
    // eslint-disable-next-line complexity
    const mdRuleMark: MarkdownIt.RuleInline = (state, silent): boolean => {
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
            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>Emphasize>Rule>Inline: No second delimiter found, discard " +
                    `'${state.src.slice(posStart, posEnd + 1)}'`);
            }
            return false;
        }

        // Exit if content is empty
        if (posEnd - posStart === 1) {
            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>Emphasize>Rule>Inline: Empty content, discard " +
                    `'${state.src.slice(posStart, posEnd + 1)}'`);
            }
            return false;
        }

        if (!silent) {
            // If not silent give rules on how to render the token
            // >> Add token for the begin of the marking
            const tokenMarkBegin = state.push("mark_begin", "mark", 1);
            tokenMarkBegin.markup = markDelimiter;
            tokenMarkBegin.attrSet("class", "bass");
            // >> Add token for the mark text
            const tokenMarkText = state.push("text", "", 0);
            tokenMarkText.content = state.src
                .slice(posStart + 1, posEnd)
                .replace(/[ ]+/g, " ")
                .trim();
            // >> Add token for the end of the marking
            const tokenMarkEnd = state.push("mark_end", "mark", -1);
            tokenMarkEnd.markup = markDelimiter;

            if (DEBUG_APP) {
                console.debug("MarkdownIt>Plugin>Emphasize>Rule>Inline: Add token to render emphasized string " +
                    `'${tokenMarkText.content}'`, state.tokens);
            }
        }
        state.pos = posEnd + 1;
        return true;
    };

    md.inline.ruler.before(
        "emphasis", // new rule will be added before this one
        "mark",     // name of added rule
        mdRuleMark  // rule function
    );
};
