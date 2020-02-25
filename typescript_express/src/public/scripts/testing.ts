import { ListHandler, NewListHandler, ListNodeType,ListNodeChildrenType } from "./testing_list_handler";

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
};
