import * as header from "./header";
import * as navigationBar from "./navigationBar";
import * as pdfOptions from "./pdfOptions";
import { StartExpressServerOptions } from "../config/express";

export { header };
export { navigationBar };
export { pdfOptions };


export interface TemplateOptions {
    error?: boolean
    sockets?: boolean
    marktexRenderer?: boolean
}

export const getHeaderDefaults = (
    options: StartExpressServerOptions, templateOptions: TemplateOptions = {}
): header.HbsHeader => {
    const stylesheets = [
        { path: "/stylesheets/global.css" }
    ];
    if (!options.production) {
        stylesheets.push({ path: "/stylesheets/debug.css" });
    }
    const defaultHeader: header.HbsHeader = {
        author: "AnonymerNiklasistanonym",
        favicon: {
            ico: "/favicon/favicon.ico",
            png: {
                postfix: ".png",
                prefix: "/favicon/favicon_",
                sizes: [ 16, 48, 128, 180, 196, 256, 512 ]
            },
            svg: "/favicon/favicon.svg"
        },
        scripts: [],
        stylesheets,
        webApp: {
            manifestPath: "/manifest.json",
            name: "MarkTeX",
            themeColor: "#0289ff"
        }
    };
    if (templateOptions.error) {
        defaultHeader.stylesheets.push({ path: "/stylesheets/error.css" });
    }
    if (templateOptions.sockets) {
        defaultHeader.scripts.push({ path: "/socket.io/socket.io.js" });
    }
    if (templateOptions.marktexRenderer) {
        defaultHeader.stylesheets.push(
            { path: "/katex/katex.min.css" },
            { path: "/hljs/default.css" },
            { path: "/githubmdcss/github-markdown.css" },
            { path: "/stylesheets/marktex_document_editor.css" }
        );
    }
    return defaultHeader;
};

export const getNavigationBarDefaults = (
    options: StartExpressServerOptions, optionsNavigationBar: navigationBar.NavigationBarOptions = {}
): navigationBar.NavigationBar => {
    const defaultNavigationBar: navigationBar.NavigationBar = {
        links: [
            { title: "Home", url: "/" },
            { title: "Testing", url: "/testing" },
            { alignRight: true, title: "About", url: "https://github.com/AnonymerNiklasistanonym/MarkTeX" }
        ]
    };
    if (optionsNavigationBar.loggedIn) {
        defaultNavigationBar.links.push({ alignRight: true, title: "Logout", url: "/logout" });
        defaultNavigationBar.links.push({ alignRight: true, title: "Profile", url: "/account" });
    } else {
        defaultNavigationBar.links.push({ alignRight: true, title: "Login/Register", url: "/login" });
    }
    return defaultNavigationBar;
};
