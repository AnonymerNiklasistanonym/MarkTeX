import { LinkifyIt } from 'linkify-it'

import State = require('./rules_core/state_core');
import StateBlock = require('./rules_block/state_block');
import StateInline = require('./rules_inline/state_inline');

import Core = require('./parser_core');
import ParserBlock = require('./parser_block');
import ParserInline = require('./parser_inline');

import Renderer = require('./renderer');
import Ruler = require('./ruler');
import Token = require('./token');

export = MarkdownIt;
export as namespace markdownit;

declare const MarkdownIt: MarkdownItConstructor;

interface MarkdownItConstructor {
    /**
     * Creates parser instance with given config. Can be called without `new`.
     *
     * @param presetName
     *
     * MarkdownIt provides named presets as a convenience to quickly
     * enable/disable active syntax rules and options for common use cases.
     *
     * - ["commonmark"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/commonmark.js) -
     *   configures parser to strict [CommonMark](http://commonmark.org/) mode.
     * - [default](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/default.js) -
     *   similar to GFM, used when no preset name given. Enables all available rules,
     *   but still without html, typographer & autolinker.
     * - ["zero"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/zero.js) -
     *   all rules disabled. Useful to quickly setup your config via `.enable()`.
     *   For example, when you need only `bold` and `italic` markup and nothing else.
     *
     * @example
     * ```javascript
     * // commonmark mode
     * var md = require('markdown-it')('commonmark');
     *
     * // default mode
     * var md = require('markdown-it')();
     *
     * // enable everything
     * var md = require('markdown-it')({
     *   html: true,
     *   linkify: true,
     *   typographer: true
     * });
     * ```
     *
     * @example Syntax highlighting
     * ```js
     * var hljs = require('highlight.js') // https://highlightjs.org/
     *
     * var md = require('markdown-it')({
     *   highlight: function (str, lang) {
     *     if (lang && hljs.getLanguage(lang)) {
     *       try {
     *         return hljs.highlight(lang, str, true).value;
     *       } catch (__) {}
     *     }
     *
     *     return ''; // use external default escaping
     *   }
     * });
     * ```
     *
     * @example Syntax highlighting with full wrapper override (if you need assign class to `<pre>`):
     * ```javascript
     * var hljs = require('highlight.js') // https://highlightjs.org/
     *
     * // Actual default values
     * var md = require('markdown-it')({
     *   highlight: function (str, lang) {
     *     if (lang && hljs.getLanguage(lang)) {
     *       try {
     *         return '<pre class="hljs"><code>' +
     *                hljs.highlight(lang, str, true).value +
     *                '</code></pre>';
     *       } catch (__) {}
     *     }
     *
     *     return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
     *   }
     * });
     * ```
     **/
    new (): MarkdownIt;
    new (presetName: "commonmark" | "zero" | "default", options?: MarkdownIt.Options): MarkdownIt;
    new (options: MarkdownIt.Options): MarkdownIt;
    (): MarkdownIt;
    (presetName: "commonmark" | "zero" | "default", options ?: MarkdownIt.Options): MarkdownIt;
    (options: MarkdownIt.Options): MarkdownIt;
}

interface MarkdownIt {
    render(md: string, env?: any): string;
    renderInline(md: string, env?: any): string;
    parse(src: string, env: any): Token[];
    parseInline(src: string, env: any): Token[];

    /*
    // The following only works in 3.0
    // Since it's still not allowed to target 3.0, i'll leave the code commented out

    use<T extends Array<any> = any[]>(
        plugin: (md: MarkdownIt, ...params: T) => void,
        ...params: T
    ): MarkdownIt;
    */

    use(plugin: (md: MarkdownIt, ...params: any[]) => void, ...params: any[]): MarkdownIt;

    utils: {
        assign(obj: any): any;
        isString(obj: any): boolean;
        has(object: any, key: string): boolean;
        unescapeMd(str: string): string;
        unescapeAll(str: string): string;
        isValidEntityCode(str: any): boolean;
        fromCodePoint(str: string): string;
        escapeHtml(str: string): string;
        arrayReplaceAt(src: any[], pos: number, newElements: any[]): any[]
        isSpace(str: any): boolean;
        isWhiteSpace(str: any): boolean
        isMdAsciiPunct(str: any): boolean;
        isPunctChar(str: any): boolean;
        escapeRE(str: string): string;
        normalizeReference(str: string): string;
    }

    disable(rules: string[] | string, ignoreInvalid?: boolean): MarkdownIt;
    enable(rules: string[] | string, ignoreInvalid?: boolean): MarkdownIt;
    set(options: MarkdownIt.Options): MarkdownIt;
    normalizeLink(url: string): string;
    normalizeLinkText(url: string): string;
    validateLink(url: string): boolean;
    block: ParserBlock;
    core: Core;
    helpers: any;
    inline: ParserInline;
    linkify: LinkifyIt;
    renderer: Renderer;
}

declare module MarkdownIt {
    interface Options {
        /**
         * Set `true` to enable HTML tags in source. Be careful!
         * That's not safe! You may need external sanitizer to protect output from XSS.
         * It's better to extend features via plugins, instead of enabling HTML.
         */
        html?: boolean;
        /**
         * Set `true` to add '/' when closing single tags
         * (`<br />`). This is needed only for full CommonMark compatibility. In real
         * world you will need HTML output.
         */
        xhtmlOut?: boolean;
        /**
         * Set `true` to convert `\n` in paragraphs into `<br>`.
         */
        breaks?: boolean;
        /**
         * CSS language class prefix for fenced blocks.
         * Can be useful for external highlighters.
         */
        langPrefix?: string;
        /**
         * Set `true` to autoconvert URL-like text to links.
         */
        linkify?: boolean;
        /**
         * Set `true` to enable [some language-neutral replacement](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js) +
         *   quotes beautification (smartquotes).
         */
        typographer?: boolean;
        /**
         * String or Array. Double + single quotes replacement
         * pairs, when typographer enabled and smartquotes on. For example, you can
         * use `'«»„“'` for Russian, `'„“‚‘'` for German, and
         * `['«\xA0', '\xA0»', '‹\xA0', '\xA0›']` for French (including nbsp).
         */
        quotes?: string;
        /**
         * Highlighter function for fenced code blocks.
         * Should return escaped HTML.
         * It can also return empty string if the source was not changed and should be escaped
         * externaly. If result starts with <pre... internal wrapper is skipped.
         */
        highlight?: (str: string, lang: string) => void;
    }

    interface Rule<S extends State = State> {
        (state: S, silent?: boolean): boolean | void;
    }

    interface RuleB<S extends State = State> {
        (state: S, startLine: number, endLine: number, silent?: boolean): boolean | void;
    }

    interface RuleInline extends Rule<StateInline> {}
    interface RuleBlock extends RuleB<StateBlock> {}

    interface RulerInline extends Ruler<StateInline> {}
    interface RulerBlock extends Ruler<StateBlock, RuleB<StateBlock>> {}

    type TokenRender = (tokens: Token[], index: number, options: any, env: any, self: Renderer) => string;

    interface Delimiter {
        close: boolean;
        end: number;
        jump: number;
        length: number;
        level: number;
        marker: number;
        open: boolean;
        token: number;
    }
}
