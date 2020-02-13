import handlebars from "handlebars";

import { writeHelloWorld, keyboardListener } from "./test";
import { connectToSocket } from "./sockets";

const component = (content?: string): HTMLDivElement => {
    const element = document.createElement("div");
    if (content !== undefined) {
        element.innerHTML = content;
    } else {
        element.innerHTML = ["Hello", "webpack"].join(" ");
    }
    return element;
};

window.onload = (): void => {

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
        name: "haribo",
        age: 42,
        text: "This is nice"
    })));

};
