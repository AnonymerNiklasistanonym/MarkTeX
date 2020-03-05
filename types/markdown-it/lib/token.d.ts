declare class Token {
    /**
     *  Create new token and fill passed properties.
     * @param nesting Nesting level, the same as `state.level`
     * @param tag Html tag name (e.g. "p")
     * @param type Type of the token (e.g. "paragraph_open")
     **/
    constructor(type: string, tag: string, nesting: number);
    /** Get the value of attribute `name`, or null if it does not exist. */
    attrGet: (name: string) => string | null;
    /** Search attribute index by name. */
    attrIndex: (name: string) => number;
    /**
     * Join value to existing attribute via space.
     * Or create new attribute if not exists.
     * Useful to operate with token classes.
     */
    attrJoin: (name: string, value: string) => void;
    /** Add `[ name, value ]` attribute to list. Init attrs if necessary. */
    attrPush: (attrData: string[]) => void;
    /** Set `name` attribute to `value`. Override old value if exists. */
    attrSet: (name: string, value: string) => void;
    /**
     * Html attributes.
     * @example [ [ name1, value1 ], [ name2, value2 ] ]
     */
    attrs: string[][] | null;
    /**
     * True for block-level tokens, false for inline tokens.
     * Used in renderer to calculate line breaks.
     */
    block: boolean;
    /** An array of child nodes (inline and img tokens). */
    children: Token[] | null;
    /**
     * In a case of self-closing tag (code, html, fence, etc.),
     * it has contents of this tag.
     */
    content: string;
    /**
     * If it's true, ignore this element when rendering.
     * Used for tight lists to hide paragraphs.
     */
    hidden: boolean;
    /** Fence infostring */
    info: string;
    /** Nesting level, the same as `state.level`. **/
    level: number;
    /**
     * Source map info.
     * @example [ line_begin, line_end ]
     */
    map: number[];
    /** '*' or '_' for emphasis, fence string for fence, etc. */
    markup: string;
    /** A place for plugins to store an arbitrary data */
    meta: any;
    /**
     * Level change (number in {-1, 0, 1} set), where:
     *
     * -  `1` means the tag is opening
     * -  `0` means the tag is self-closing
     * - `-1` means the tag is closing
     **/
    nesting: number;
    /**
     * Html tag name.
     * @example "p"
     */
    tag: string;
    /**
     * Type of the token.
     * @example "paragraph_open"
     */
    type: string;
}

export = Token;
