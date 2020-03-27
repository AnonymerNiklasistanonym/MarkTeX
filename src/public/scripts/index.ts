
import { keyboardListener, writeHelloWorld } from "./test";
import { connectToSocket } from "./sockets";
import handlebars from "handlebars";


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

    handlebars.registerHelper("customHelper", (input) => {
        return `"${input}"`;
    });
    window.alert("It works?");

    const template = "<div id=\"handlebars-template\">"
        + "<div class=\"cat\">"
        + "<h1>{{name}}</h1>"
        + "<p>Age: {{age}}</p>"
        + "<p>Helper: {{customHelper text}}</p>"
        + "</div>"
        + "</div>";

    const renderTemplate = handlebars.compile(template);
    document.body.appendChild(component(renderTemplate({
        age: 42,
        name: "haribo",
        text: "This is nice"
    })));

});
