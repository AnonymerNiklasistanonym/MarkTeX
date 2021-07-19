/**
 * Create child node from template
 *
 * @param htmlContent HTML content to convert to child node
 * @param sandboxFunc Function that can add events to the rendered HTML elements that are preserved when returned
 * @returns Child node that contains the rendered contents
 */
// eslint-disable-next-line no-shadow
export const createChildNode = (htmlContent: string, sandboxFunc?: (element: HTMLElement) => void): ChildNode => {
    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    if (sandboxFunc) {
        sandboxFunc(element);
    }
    if (element.firstChild) {
        return element.firstChild;
    }
    throw Error(`No element was created using the htmlContent parameter (htmlContent=${htmlContent})`);
};
