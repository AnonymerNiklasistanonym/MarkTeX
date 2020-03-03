import { ListHandler, NewListHandler, ListNodeType,ListNodeChildrenType } from "./testing_list_handler";
import { md, katex } from "./documentRenderer/markdownRenderer";

// eslint-disable-next-line complexity
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

    markdownTest.innerHTML = md.render(
        "**hey you** *you are looking amazing* :D\n" +
        "\n" +
        "=abcdefg=\n" +
        "abc\n\ndefg\n" +
        "=abc\n\ndefg=\n" +
        "=a ==b =c= ==d==\n" +
        "\n" +
        "Inline code `std::cout << \"cool\"` and big code thing:\n" +
        "```cpp\nstd::cout << \"cool\" << std::endl;\n```" +
        "\n" +
        "Inline math $c = \\pm\\sqrt{a^2 + b^2}$ and big math block:\n" +
        "$$\nc = \\pm\\sqrt{a^2 + b^2}\n$$" +
        "and inline big math:\n" +
        "$$c = \\pm\\sqrt{a^2 + b^2}$$");

    const liveInput = document.getElementById("testing-live-md-rendering-input-textarea") as HTMLTextAreaElement;
    const liveOutput = document.getElementById("testing-live-md-rendering-output") as HTMLDivElement;

    if (liveInput !== undefined && liveOutput !== undefined) {
        liveInput.addEventListener("input", (event: Event): void => {
            // eslint-disable-next-line no-console
            console.debug("live input has changed: ", {
                selection: {
                    start: liveInput.selectionStart,
                    end: liveInput.selectionEnd,
                    direction: liveInput.selectionDirection
                },
                content: liveInput.value,
                event
            });
            liveOutput.innerHTML = md.render(liveInput.value);
        });
    }
};
