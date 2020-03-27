import "../webpackVars";
import * as emphasizePlugin from "./emphasizePlugin";
import * as imagePandocPlugin from "./imagePandocPlugin";
import * as katexPlugin from "./katexPlugin";
import * as latexPlugin from "./latexPlugin";
import hljs from "highlight.js";
import MarkdownIt from "markdown-it";

export { hljs };
export { katex } from "./katexPlugin";
export { renderLatexBlocks } from "./latexPlugin";


const katexPluginOptions: katexPlugin.Options = {
    onError: (error, originalString) => {
        // TODO Add integration
        // eslint-disable-next-line no-console
        console.error(`MarkdownIt>Plugin>KaTeX: Error when parsing '${originalString}': ${error.message}`);
    }
};

export const md = new MarkdownIt({
    highlight: (str, lang): string | void => {
        if (DEBUG_APP) {
            // eslint-disable-next-line no-console
            console.debug(`MarkdownIt>highlight(str=${str}, lang=${lang})`);
        }
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="hljs"><code> ${hljs.highlight(lang, str, true).value}</code></pre>`;
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`MarkdownIt>Plugin>Highlight.js: Error when parsing '${str}' [lang=${lang}]: `
                              + error.message);
            }
        }
        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    },
    html: true,
    linkify: true,
    quotes: "„“‚‘"
})
    .use(imagePandocPlugin.register)
    .use(emphasizePlugin.register)
    .use(latexPlugin.register)
    .use(katexPlugin.register, katexPluginOptions);
