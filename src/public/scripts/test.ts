export const writeHelloWorld = (): void => {
    const words: string[] = [ "Hello", "World" ];
    for (const word of words) {
        // eslint-disable-next-line no-console
        console.log(word);
    }
};

export const keyboardListener = (): void => {
    window.addEventListener("keydown", keyboardEvent => {
        if (keyboardEvent.isComposing || keyboardEvent.key === "a") {
            // eslint-disable-next-line no-console
            console.log(`a: key pressed: ${String.fromCharCode(keyboardEvent.keyCode)}`);
        }
        // eslint-disable-next-line no-console
        console.log(`key pressed: ${String.fromCharCode(keyboardEvent.keyCode)}`);
    }, false);
    // eslint-disable-next-line complexity
    document.addEventListener("keyup", (e): void => {
        if (e.key === "M") {
            alert("M key was pressed");
        }
        if (e.key === "m") {
            alert("m key was pressed");
        } else if (e.ctrlKey && e.key === "b") {
            alert("Ctrl + B shortcut combination was pressed");
        } else if (e.ctrlKey && e.altKey && e.key === "y") {
            alert("Ctrl + Alt + Y shortcut combination was pressed");
        }
    });
};
