import MarkdownIt = require("..");
import State = require("../rules_core/state_core");
import Token = require("../token");

export = StateBlock;

declare class StateBlock extends State {
    /** Used in lists to determine if they interrupt a paragraph */
    parentType: 'blockquote' | 'list' | 'root' | 'paragraph' | 'reference';

    //
    // Internal state variables
    //

    /** Line end offsets for fast jumps */
    eMarks: number[];
    /** Line begin offsets for fast jumps */
    bMarks: number[];
    /**
     * An amount of virtual spaces (tabs expanded) between beginning
     * of each line (bMarks) and real beginning of that line.
     *
     * It exists only as a hack because blockquotes override bMarks
     * losing information in the process.
     *
     * It's used only when expanding tabs, you can think about it as
     * an initial tab length, e.g. bsCount=21 applied to string `\t123`
     * means first tab should be expanded to 4-21%4 === 3 spaces.
     */
    bsCount: number[];
    /** Indents for each line (tabs expanded) */
    sCount: number[];
    /** Offsets of the first non-space characters (tabs not expanded) */
    tShift: number[];

    // Block parser variables

    /**
     * Required block content indent (for example, if we are
     * inside a list, it would be positioned after list marker)
     */
    blkIndent: number;
    /** Indent of the current dd block (-1 if there isn't any) */
    ddIndent: number;
    /** Line index in src */
    line: number;
    /** Lines count */
    lineMax: number;
    /** Loose/tight mode for lists */
    tight: boolean;
    /** Indent of the current dd block (-1 if there isn't any) */
    listIndent: number;

    /** Renderer */
    result: string;

    /** Push new token to "stream". */
    push: (type: string, tag: string, nesting: number) => Token;
    /**
     * ```js
     * return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
     * ```
     */
    isEmpty: (line: string) => boolean;
    /**
     * ```js
     * for (var max = this.lineMax; from < max; from++) {
     *    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) { break; }
     *  }
     *  return from;
     * ```
     */
    skipEmptyLines: (from: number) => number;

    /**
     * Skip spaces from given position.
     *
     * ```js
     * for (var max = this.src.length; pos < max; pos++) {
     *     if (!isSpace(this.src.charCodeAt(pos))) { break; }
     * }
     * return pos;
     * ```
     */
    skipSpaces: (pos: number) => number;

    /**
     * Skip spaces from given position in reverse.
     *
     * ```js
     * if (pos <= min) { return pos; }
     * while (pos > min) {
     *     if (!isSpace(this.src.charCodeAt(--pos))) { return pos + 1; }
     * }
     * return pos;
     * ```
     */
    skipSpacesBack: (pos: number, min: number) => number;

    /**
     * Skip char codes from given position.
     *
     * ```js
     * for (const max = this.src.length; pos < max; pos++) {
     *     if (this.src.charCodeAt(pos) !== code) { break; }
     * }
     * return pos;
     * ```
     */
    skipChars: (pos: number, code: number) => number;

    /**
     * Skip char codes reverse from given position - 1.
     *
     * ```js
     * if (pos <= min) { return pos; }
     *
     * while (pos > min) {
     *     if (code !== this.src.charCodeAt(--pos)) { return pos + 1; }
     * }
     * return pos;
     * ```
     */
    skipCharsBack: (pos: number, code: number, min: number) => number;
    /** Cut lines range from source */
    getLines: (begin: number, end: number, indent: number, keepLastLF: boolean) => string;

    /** Re-export Token class to use in block rules */
    Token: Token;
}
