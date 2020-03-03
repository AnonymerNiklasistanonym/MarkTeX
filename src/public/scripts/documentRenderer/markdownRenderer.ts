import MarkdownIt from "markdown-it";
import * as hljs from "highlight.js";
export { hljs };
import * as emphasizePlugin from "./emphasizePlugin";
import * as katexPlugin from "./katexPlugin";
export { katex } from "./katexPlugin";
import * as imagePandocPlugin from "./imagePandocPlugin";
import "../webpackVars";

export const md = new MarkdownIt({
    linkify: true,
    quotes: "„“‚‘",
    highlight: (str, lang): string | void => {
        if (DEBUG_APP) {
            // eslint-disable-next-line no-console
            console.debug(`highlight: (str=${str}, lang=${lang})`);
        }
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="hljs"><code> ${hljs.highlight(lang, str, true).value}</code></pre>`;
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
            }
        }
        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    }
})
    .use(imagePandocPlugin.register)
    .use(emphasizePlugin.register)
    .use(katexPlugin.register);