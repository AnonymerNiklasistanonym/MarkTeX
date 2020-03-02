import { ListHandler, NewListHandler, ListNodeType,ListNodeChildrenType } from "./testing_list_handler";
import * as katex from "katex";
import * as hljs from "highlight.js";
import MarkdownIt from "markdown-it";

window.onload = (): void => {
    const listHandler = new ListHandler();

    const newListHandler = new NewListHandler(document.getElementById("testing-two") as HTMLUListElement);
    newListHandler.load({
        listSections: [{
            listChildren: [{
                type: ListNodeType.MARKDOWN,
                content: "abc"
            },{
                type: ListNodeType.MARKDOWN,
                content: "bca"
            },{
                type: ListNodeType.MARKDOWN,
                content: "cab",
                listChildrenType: ListNodeChildrenType.ALPHABETICAL,
                listChildren: [{
                    type: ListNodeType.MARKDOWN,
                    content: "abc"
                },{
                    type: ListNodeType.MARKDOWN,
                    content: "bca"
                },{
                    type: ListNodeType.MARKDOWN,
                    content: "cab"
                },{
                    type: ListNodeType.MARKDOWN,
                    content: "WOW"
                }]
            },{
                type: ListNodeType.MARKDOWN,
                content: "WOW"
            }]
        }]
    });

    const list = document.createElement("ul");
    const listElement = listHandler.createListElement();
    list.appendChild(listElement);

    document.addEventListener("keydown", e => {
        listHandler.setCtrlKeyPressed(e.ctrlKey);

        if (e.key === "a") {
            listHandler.addList(listElement);
        }
    });
    document.addEventListener("keyup", () => {
        listHandler.setCtrlKeyPressed(false);
    });

    const listContainer = document.getElementById("testing");
    if (listContainer) {
        listContainer.appendChild(list);
    }

    listHandler.addList(listElement);
    const newListElement = listHandler.addList(listElement);
    listHandler.addList(listElement);

    if (newListElement) {
        listHandler.indentList(newListElement);
    }

    const katexTest = document.getElementById("testing-katex") as HTMLDivElement;
    const markdownTest = document.getElementById("testing-markdown-it") as HTMLDivElement;
    const pdf2svgTest = document.getElementById("testing-pdf2svg") as HTMLDivElement;

    try {
        katex.render("c = \\pm\\sqrt{a^2 + b^2}", katexTest, {
            throwOnError: true
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }

    // Actual default values
    const md: MarkdownIt = new MarkdownIt({
        highlight: (str, lang) => {
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
    });
    // TODO .use(plugin1)
    markdownTest.innerHTML =  md.render("**hey you** *you are looking amazing* :D");
};
