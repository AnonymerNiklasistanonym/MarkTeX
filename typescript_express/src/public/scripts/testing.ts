let ctrlKeyPressed = false;

class ListHandler {
    addList(liElement: HTMLLIElement): HTMLLIElement | undefined {
        console.info("addList()"); // eslint-disable-line no-console
        if (liElement.parentNode) {
            const newListLi = this.createListElement();
            liElement.parentNode.insertBefore(newListLi, liElement.nextSibling);
            return newListLi;
        }
    }
    removeList(liElement: HTMLLIElement): void {
        console.info("removeList()"); // eslint-disable-line no-console
        if (liElement.parentNode) {
            liElement.parentNode.removeChild(liElement);
        }
    }
    // eslint-disable-next-line complexity
    indentList(liElement: HTMLLIElement, indent=1): void {
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
            if (liElement.parentNode?.nextSibling?.nodeName.toLowerCase() === "ul") {
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
            if (liElement.parentNode?.previousSibling?.nodeName.toLowerCase() === "ul") {
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
    createListElement(): HTMLLIElement {
        const newListLi = document.createElement("li");
        newListLi.textContent = "new";
        // eslint-disable-next-line complexity
        newListLi.addEventListener("keydown", e => {
            console.log(`Key "${e.key}" pressed  [event: keydown]`); // eslint-disable-line no-console
            // eslint-disable-next-line no-console
            console.log(`e.key==='\t' "${e.key === "\t"}, e.key==='	' "${e.key === "	"}`);
            if (e.key === "\t" && !e.repeat) {
                this.indentList(newListLi, 1);
            }
            if (e.ctrlKey && e.key === "\t" && !e.repeat) {
                this.indentList(newListLi, -1);
            }
        });
        newListLi.addEventListener("click", e => {
            this.indentList(newListLi, ctrlKeyPressed ? -1 : 1);
        });
        return newListLi;
    }
};

window.onload = (): void => {
    const listHandler = new ListHandler();

    const list = document.createElement("ul");
    const listElement = listHandler.createListElement();
    list.appendChild(listElement);

    document.addEventListener("keydown", e => {
        ctrlKeyPressed = e.ctrlKey;

        if (e.key === "a") {
            listHandler.addList(listElement);
        }
    });
    document.addEventListener("keyup", e => {
        ctrlKeyPressed = false;
    });

    window.addEventListener("keydown", keyboardEvent => {
        if (keyboardEvent.metaKey) {
            // eslint-disable-next-line no-console
            console.log(`a: key pressed: ${String.fromCharCode(keyboardEvent.keyCode)}`);
        }
        // eslint-disable-next-line no-console
        console.log(`key pressed: ${String.fromCharCode(keyboardEvent.keyCode)}`);
    }, false);

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
};
