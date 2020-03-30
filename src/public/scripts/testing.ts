import "./webpackVars";
import * as marktexDocumentEditor from "./marktex_document_editor";


// eslint-disable-next-line no-console
console.log(`DEBUG_APP=${DEBUG_APP}`);

// eslint-disable-next-line complexity
window.addEventListener("load", (): void => {

    // Get live  input/output elements
    const marktexEditor = document.getElementById("marktex-editor") as HTMLTextAreaElement;
    const liveInput = document.getElementById("marktex-input") as HTMLTextAreaElement;
    const liveOutput = document.getElementById("marktex-output") as HTMLDivElement;

    const marktexButtonBoth = document.getElementById("marktex-button-both") as HTMLElement;
    const marktexButtonEdit = document.getElementById("marktex-button-edit") as HTMLElement;
    const marktexButtonView = document.getElementById("marktex-button-view") as HTMLElement;

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
        marktexDocumentEditor.render({
            marktexEditorInput: liveInput,
            marktexEditorOutput: liveOutput
        });
        marktexDocumentEditor.enableEditorModeSwitching({
            bothButton: marktexButtonBoth,
            marktexEditor,
            onlyEditButton: marktexButtonEdit,
            onlyViewButton: marktexButtonView,
            selectedButtonClass: "selected"
        });
        marktexDocumentEditor.enableEditorRendering({
            marktexEditorInput: liveInput,
            marktexEditorOutput: liveOutput
        });
    }
});
