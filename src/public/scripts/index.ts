
import * as apiRequests from "./apiRequests";
import * as notifications from "./notifications";
import { keyboardListener, writeHelloWorld } from "./test";
import { connectToSocket } from "./sockets";
// import handlebars from "handlebars";


const component = (content?: string): HTMLDivElement => {
    const element = document.createElement("div");
    if (content !== undefined) {
        element.innerHTML = content;
    } else {
        element.innerHTML = [ "Hello", "webpack" ].join(" ");
    }
    return element;
};


window.addEventListener("load", (): void => {

    writeHelloWorld();

    connectToSocket();

    document.body.appendChild(component());

    keyboardListener();

    // handlebars.registerHelper("customHelper", (input) => {
    //     return `"${input}"`;
    // });
    // window.alert("It works?");

    // const template = "<div id=\"handlebars-template\">"
    //     + "<div class=\"cat\">"
    //     + "<h1>{{name}}</h1>"
    //     + "<p>Age: {{age}}</p>"
    //     + "<p>Helper: {{customHelper text}}</p>"
    //     + "</div>"
    //     + "</div>";
    //
    // const renderTemplate = handlebars.compile(template);
    // document.body.appendChild(component(renderTemplate({
    //     age: 42,
    //     name: "haribo",
    //     text: "This is nice"
    // })));

    const buttonRemove = document.getElementById("document-button-add") as HTMLButtonElement;
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    buttonRemove.addEventListener("click", async () => {
        try {
            const response = await apiRequests.document.create({
                content: "",
                date: new Date().toDateString(),
                title: "New document"
            });
            if (response) {
                await notifications.show({
                    body: `New document was created ${response.title} by ${response.authors} from ${response.date}`,
                    onClick: () => {
                        const documentWindow = window.open(`/document/${response.id}`);
                        if (documentWindow) { documentWindow.focus(); }
                    },
                    title: `Document was imported: ${response.title}`
                });
                // Redirect user to document page
                window.location.href = `/document/${response.id}`;
            } else {
                // eslint-disable-next-line no-console
                console.error("Something went wrong when creating a new document");
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
    });

});
