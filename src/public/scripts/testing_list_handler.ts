// eslint-disable-next-line max-classes-per-file
export interface ListRoot {
    listSections: ListSection[]
}

export interface ListSection {
    listChildren: ListNode[]
}

export interface ListNode {
    type: ListNodeType
    content: string
    guid?: string
    listChildrenType?: ListNodeChildrenType
    listChildren?: ListNode[]
}

export enum ListNodeChildrenType {
    ALPHABETICAL = 1,
    UNORDERED = 2
}

export enum ListNodeType {
    MARKDOWN = 1,
    LATEX = 2
}

export interface NewListHandlerAddNode {
    sectionDom?: HTMLUListElement
    parentNodeDom?: HTMLLIElement
    nextNodeDom?: HTMLLIElement
}

export class NewListHandler {
    private rootListElement: HTMLUListElement;
    private listData: ListRoot;
    constructor (rootListElement: HTMLUListElement) {
        this.rootListElement = rootListElement;
        this.listData = { listSections: [] };
    }
    load (list: ListRoot): void {
        // Clean current list
        while (this.rootListElement.firstChild) {
            this.rootListElement.firstChild.remove();
        }
        for (const section of list.listSections) {
            this.addSection(section);
        }
    }
    addSection (section: ListSection): void {
        const sectionDom = document.createElement("ul");
        for (const node of section.listChildren) {
            this.addNode({ sectionDom }, node);
        }
        if (this.rootListElement !== undefined) {
            this.rootListElement.appendChild(sectionDom);
        } else {
            throw Error("Root list element was undefined!");
        }
        // TODO Add to list data
    }
    createNodeElement (node: ListNode): HTMLLIElement {
        const nodeDom = document.createElement("li");
        nodeDom.textContent = node.content;
        nodeDom.addEventListener("click", () => {
            // eslint-disable-next-line no-console
            console.log(node);
            // this.indentList(newListLi, this.ctrlKeyPressed ? -1 : 1);
        });
        // TODO Add something to indent it -> Use a textbox or something for text editing
        // TODO Add classes
        return nodeDom;
    }
    // eslint-disable-next-line complexity
    addNode (dom: NewListHandlerAddNode, node: ListNode): void {
        const nodeDom = this.createNodeElement(node);
        if (node.listChildren) {
            for (const childNode of node.listChildren) {
                this.addNode({ ... dom, parentNodeDom: nodeDom }, childNode);
            }
        }
        if (dom.nextNodeDom !== undefined) {
            // Add after this node the current node
            if (dom.nextNodeDom.parentNode !== null) {
                dom.nextNodeDom.parentNode.insertBefore(nodeDom, dom.nextNodeDom);
            } else {
                throw Error("Parent of next dom node was null!");
            }
        } else if (dom.parentNodeDom !== undefined) {
            // Check if node already has a list child node
            if (dom.parentNodeDom.childNodes.length > 0 &&
                dom.parentNodeDom.lastChild !== null &&
                dom.parentNodeDom.lastChild.nodeName.toLowerCase() === "ul") {
                // Now insert after
                dom.parentNodeDom.lastChild.appendChild(nodeDom);
            } else {
                // Create new list and append to node
                const listListDom = document.createElement("ul");
                listListDom.appendChild(nodeDom);
                dom.parentNodeDom.appendChild(listListDom);
            }
        } else if (dom.sectionDom !== undefined) {
            dom.sectionDom.appendChild(nodeDom);
        } else {
            throw Error("Node could not be added because no section/parent/sibling was specified!");
        }
        // TODO Add to list data with GUID to find it later again
    }
    // TODO Render to markdown for export
    // TODO Insert showdown.js, katex and images
};

export class ListHandler {
    private ctrlKeyPressed = false;
    setCtrlKeyPressed (value = false): void {
        this.ctrlKeyPressed = value;
    }
    addList (liElement: HTMLLIElement): HTMLLIElement | undefined {
        console.info("addList()"); // eslint-disable-line no-console
        if (liElement.parentNode) {
            const newListLi = this.createListElement();
            liElement.parentNode.insertBefore(newListLi, liElement.nextSibling);
            return newListLi;
        }
    }
    removeList (liElement: HTMLLIElement): void {
        console.info("removeList()"); // eslint-disable-line no-console
        if (liElement.parentNode) {
            liElement.parentNode.removeChild(liElement);
        }
    }
    // eslint-disable-next-line complexity
    indentList (liElement: HTMLLIElement, indent=1): void {
        console.info("indentList()"); // eslint-disable-line no-console
        // TODO Check if parent has children, if not do nothing
        // TODO Implement behaviour if indent is -1
        // TODO Check if before or after elements have the same indent and if yes merge them
        const currentListUl = liElement.parentNode;
        if (currentListUl) {
            if (indent > 0) {
                // Stop if it is the only element in the list
                if (currentListUl.childElementCount === 1) {
                    return;
                }
                const oldListSibling = liElement.nextSibling;
                const newListUl = document.createElement("ul");
                newListUl.appendChild(liElement);
                liElement.textContent = liElement.textContent + " 1";
                currentListUl.insertBefore(newListUl, oldListSibling);
            } else {
                const upperListUl = currentListUl.parentNode;
                if (upperListUl && upperListUl.nodeName.toLowerCase() === "ul") {
                    upperListUl.insertBefore(liElement, currentListUl.nextSibling);
                    liElement.textContent = liElement.textContent + " -1";
                    upperListUl.removeChild(currentListUl);
                }
            }
            // TODO These are too simple -> Use insert before for correct insetions
            // TODO Find out why sometimes nodes are completely removed
            if (liElement.parentNode !== null &&
                liElement.parentNode.nextSibling !== null &&
                liElement.parentNode.nextSibling.nodeName.toLowerCase() === "ul") {
                // Merge
                const lowerList = liElement.parentNode.nextSibling;
                const oldList = liElement.parentNode;
                lowerList.childNodes.forEach(currentChild => {
                    oldList.appendChild(currentChild);
                });
                if (lowerList.parentNode) {
                    lowerList.parentNode.removeChild(lowerList);
                }
            }
            if (liElement.parentNode !== null &&
                liElement.parentNode.previousSibling !== null &&
                liElement.parentNode.previousSibling.nodeName.toLowerCase() === "ul") {
                // Merge
                const upperList = liElement.parentNode.previousSibling;
                const oldList = liElement.parentNode;
                oldList.childNodes.forEach(currentChild => {
                    upperList.appendChild(currentChild);
                });
                if (oldList.parentNode) {
                    oldList.parentNode.removeChild(oldList);
                }
            }
        }
    }
    createListElement (): HTMLLIElement {
        const newListLi = document.createElement("li");
        newListLi.textContent = "new";
        // TODO Do this via keyboard controls and not with clicking
        newListLi.addEventListener("click", () => {
            this.indentList(newListLi, this.ctrlKeyPressed ? -1 : 1);
        });
        // TODO Make it able to change content as soon as one element is selected
        return newListLi;
    }
    switchListType (ulElement: HTMLUListElement): void {
        // TODO Switch list indentation type (checkbox, 1...99, -)
    }
    // TODO: Allow different kinds of lists (top list elements are the section with a special class)
    convertListToMd (ulElement: HTMLUListElement): string {
        // TODO Convert list to markdown document
        return "";
    }
};
