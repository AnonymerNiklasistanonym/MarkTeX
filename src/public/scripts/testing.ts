import "./webpackVars";
import { md, renderLatexBlocks } from "./documentRenderer/markdownRenderer";


// eslint-disable-next-line no-console
console.log(`DEBUG_APP=${DEBUG_APP}`);

// eslint-disable-next-line complexity
window.addEventListener("load", (): void => {

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
        liveOutput.innerHTML = md.render(liveInput.value, { renderTimeString: new Date().toISOString() });

        // eslint-disable-next-line complexity
        liveInput.addEventListener("input", (event: Event): void => {
            if (DEBUG_APP) {
                // eslint-disable-next-line no-console
                console.debug("Testing: MarkdownIt live input has changed: ", {
                    content: liveInput.value,
                    event,
                    selection: {
                        direction: liveInput.selectionDirection,
                        end: liveInput.selectionEnd,
                        start: liveInput.selectionStart
                    }
                });
            }
            // Update document preview
            liveOutput.innerHTML = md.render(liveInput.value, { renderTimeString: new Date().toISOString() });
            renderLatexBlocks();
        });
    }
});
