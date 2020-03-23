import { md } from "./documentRenderer/markdownRenderer";
import * as apiRequests from "./api_requests";
import "./webpackVars";

export interface RequestLatexBlock {
    svgData: string
    id: number
}

// eslint-disable-next-line no-console
console.log(`DEBUG_APP=${DEBUG_APP}`);

// eslint-disable-next-line complexity
window.onload = (): void => {

    // Get live  input/output elements
    const liveInput = document.getElementById("testing-live-md-rendering-input-textarea") as HTMLTextAreaElement;
    const liveOutput = document.getElementById("testing-live-md-rendering-output") as HTMLDivElement;

    // Setup live input/output elements on load
    if (liveInput !== undefined && liveOutput !== undefined) {
        if (liveInput.value === "") {
            liveInput.value = "**hey you** *you are looking amazing* :D\n" +
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
            "$$c = \\pm\\sqrt{a^2 + b^2}$$\n" +
            "\n" +
            "\\begin{center}\n" +
            "This is a \\LaTeX block where you can do complicated \\LaTeX commands.\n" +
            "\\end{center}\n";
        }
        liveOutput.innerHTML = md.render(liveInput.value, { time: new Date().toISOString() });
        // eslint-disable-next-line complexity
        liveInput.addEventListener("input", (event: Event): void => {
            if (DEBUG_APP) {
                // eslint-disable-next-line no-console
                console.debug("Testing: MarkdownIt live input has changed: ", {
                    selection: {
                        start: liveInput.selectionStart,
                        end: liveInput.selectionEnd,
                        direction: liveInput.selectionDirection
                    },
                    content: liveInput.value,
                    event
                });
            }
            // Update document preview
            liveOutput.innerHTML = md.render(liveInput.value);
            // Update latex blocks
            const latexBlocks: NodeListOf<HTMLDivElement> = document.querySelectorAll("div.markdown-latex-block");
            const timeOfRequest = new Date().toISOString();
            for (const latexBlock of latexBlocks) {
                // Make requests to get svg data from latex blocks
                const headerIncludeString = latexBlock.getAttribute("header-includes");
                const latexHeaderIncludes =
                    (headerIncludeString !== undefined && headerIncludeString !== null)
                        ? headerIncludeString.split(",") : [];
                const texContentElement = latexBlock.querySelector("p");
                if (texContentElement === undefined || texContentElement == null
                    || texContentElement.textContent === undefined || texContentElement.textContent === null) {
                    // eslint-disable-next-line no-console
                    console.log("latex block has no tex content");
                    return;
                }
                if (DEBUG_APP) {
                    // eslint-disable-next-line no-console
                    console.debug("Testing: MarkdownIt found a latex block: ", {
                        id: latexBlock.id,
                        content: texContentElement.textContent,
                        latexHeaderIncludes
                    });
                }
                apiRequests.latex2Svg({
                    id: latexBlock.id,
                    texData: texContentElement.textContent,
                    texHeaderIncludes: latexHeaderIncludes,
                    timeOfRequest
                })
                    // eslint-disable-next-line complexity
                    .then(response => {
                        // eslint-disable-next-line no-console
                        console.log(`Received a response: response=${JSON.stringify(response)}`);
                        if (latexBlock === undefined || latexBlock === null) {
                            // eslint-disable-next-line no-console
                            console.log("latex block is undefined");
                            return;
                        }
                        if (latexBlock.id !== String(response.id)) {
                            // eslint-disable-next-line no-console
                            console.log("latex block has different ID to response");
                            return;
                        }
                        const svgElement = latexBlock.querySelector("svg");
                        if (svgElement === undefined || svgElement === null) {
                            // eslint-disable-next-line no-console
                            console.log("svg element is undefined");
                            return;
                        }
                        svgElement.classList.remove("loading");
                        svgElement.innerHTML = response.svgData;
                        const svgChild = svgElement.querySelector("svg");
                        if (svgChild) {
                            svgElement.innerHTML = svgChild.innerHTML;
                        }
                    })
                    .catch(error => {
                        // eslint-disable-next-line no-console
                        console.error(`svg data could not be retrieved: ${JSON.stringify(error)}`);
                    });
            }
        });
    }
};
