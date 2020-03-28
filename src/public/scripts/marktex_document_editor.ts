import { md, renderLatexBlocks } from "./documentRenderer/markdownRenderer";

export interface RenderInput {
    marktexEditorInput: HTMLTextAreaElement
    marktexEditorOutput: HTMLElement
}

export const render = (input: RenderInput): void => {
    // Update document preview
    input.marktexEditorOutput.innerHTML = md.render(input.marktexEditorInput.value, {
        renderTimeString: new Date().toISOString()
    });
    renderLatexBlocks();
};

export interface EnableEditorRenderingInput {
    marktexEditorInput: HTMLTextAreaElement
    marktexEditorOutput: HTMLElement
}

export const enableEditorRendering = (input: EnableEditorRenderingInput): void => {
    input.marktexEditorInput.addEventListener("input", (event: Event): void => {
        // Update document preview
        render(input);
        // Save for later
        if (DEBUG_APP) {
            // eslint-disable-next-line no-console
            console.debug("Testing: MarkdownIt live input has changed: ", {
                content: input.marktexEditorInput.value,
                event,
                selection: {
                    direction: input.marktexEditorInput.selectionDirection,
                    end: input.marktexEditorInput.selectionEnd,
                    start: input.marktexEditorInput.selectionStart
                }
            });
        }
    });
};

export interface EnableEditorModeSwitchingInput {
    bothButton: HTMLElement
    onlyEditButton: HTMLElement
    onlyViewButton: HTMLElement
    marktexEditor: HTMLElement
}

export const enableEditorModeSwitching = (input: EnableEditorModeSwitchingInput): void => {
    input.bothButton.addEventListener("click", () => {
        input.marktexEditor.classList.remove("only-edit");
        input.marktexEditor.classList.remove("only-view");
    });
    input.onlyEditButton.addEventListener("click", () => {
        input.marktexEditor.classList.remove("only-view");
        input.marktexEditor.classList.add("only-edit");
    });
    input.onlyViewButton.addEventListener("click", () => {
        input.marktexEditor.classList.remove("only-edit");
        input.marktexEditor.classList.add("only-view");
    });
};