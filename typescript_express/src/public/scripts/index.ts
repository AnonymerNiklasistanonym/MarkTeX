import handlebars from "handlebars";

function component() {
  const element = document.createElement("div");

  element.innerHTML = ["Hello", "webpack"].join(" ");

 return element;
}

window.onload = () => {

    document.body.appendChild(component());

    handlebars.registerHelper("name", (context, arg) => {
        return arg;
    });
    window.alert("It works?");

};
