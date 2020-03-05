import MarkdownIt = require("..");
import State = require("../rules_core/state_core");
import Token = require("../token");

export = StateBlock;

declare class StateBlock extends State {
    /** Used in lists to determine if they interrupt a paragraph */
    parentType: 'blockquote' | 'list' | 'root' | 'paragraph' | 'reference';

    eMarks: number[];
    bMarks: number[];
    bsCount: number[];
    sCount: number[];
    tShift: number[];

    blkIndent: number;
    ddIndent: number;

    line: number;
    lineMax: number;
    tight: boolean;

    /**
     * ```js
     * for (const max = this.src.length; pos < max; pos++) {
     *     if (this.src.charCodeAt(pos) !== code) { break; }
     * }
     * return pos;
     * ```
     */
    skipChars: (pos: number, code: number) => number;
}
