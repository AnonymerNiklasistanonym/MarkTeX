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
    const onInputRender = (event: Event): void => {
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
    };
    input.marktexEditorInput.addEventListener("input", onInputRender);
    input.marktexEditorInput.addEventListener("change", onInputRender);
    input.marktexEditorInput.addEventListener("click", onInputRender);
};

export interface EnableEditorModeSwitchingInput {
    bothButton: HTMLElement
    onlyEditButton: HTMLElement
    onlyViewButton: HTMLElement
    marktexEditor: HTMLElement
    selectedButtonClass: string
}

export const enableEditorModeSwitching = (input: EnableEditorModeSwitchingInput): void => {
    input.bothButton.addEventListener("click", () => {
        input.marktexEditor.classList.remove("only-edit");
        input.marktexEditor.classList.remove("only-view");

        input.bothButton.classList.remove(input.selectedButtonClass);
        input.onlyEditButton.classList.remove(input.selectedButtonClass);
        input.onlyViewButton.classList.remove(input.selectedButtonClass);

        input.bothButton.classList.add(input.selectedButtonClass);
    });
    input.onlyEditButton.addEventListener("click", () => {
        input.marktexEditor.classList.remove("only-view");
        input.marktexEditor.classList.add("only-edit");

        input.bothButton.classList.remove(input.selectedButtonClass);
        input.onlyEditButton.classList.remove(input.selectedButtonClass);
        input.onlyViewButton.classList.remove(input.selectedButtonClass);

        input.onlyEditButton.classList.add(input.selectedButtonClass);
    });
    input.onlyViewButton.addEventListener("click", () => {
        input.marktexEditor.classList.remove("only-edit");
        input.marktexEditor.classList.add("only-view");

        input.bothButton.classList.remove(input.selectedButtonClass);
        input.onlyEditButton.classList.remove(input.selectedButtonClass);
        input.onlyViewButton.classList.remove(input.selectedButtonClass);

        input.onlyViewButton.classList.add(input.selectedButtonClass);
    });
};
