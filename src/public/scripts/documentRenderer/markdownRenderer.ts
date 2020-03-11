import MarkdownIt from "markdown-it";
import * as hljs from "highlight.js";
export { hljs };
import * as emphasizePlugin from "./emphasizePlugin";
import * as katexPlugin from "./katexPlugin";
import * as latexPlugin from "./latexPlugin";
export { katex } from "./katexPlugin";
import * as imagePandocPlugin from "./imagePandocPlugin";
import "../webpackVars";

const katexPluginOptions: katexPlugin.Options = {
    onError: (error, originalString) => {
        // TODO Add integration
        // eslint-disable-next-line no-console
        console.error(`MarkdownIt>Plugin>KaTeX: Error when parsing '${originalString}': ${error.message}`);
    }
};

export const md = new MarkdownIt({
    linkify: true,
    html: true,
    quotes: "„“‚‘",
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
    }
})
    .use(imagePandocPlugin.register)
    .use(emphasizePlugin.register)
    .use(latexPlugin.register)
    .use(katexPlugin.register, katexPluginOptions);
