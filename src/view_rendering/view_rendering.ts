import { HbsHeader } from "./header";
import { StartExpressServerOptions } from "../config/express";
export * from "./header";

export interface TemplateOptions {
    error?: boolean
    sockets?: boolean
    marktexRenderer?: boolean
}

export const getHeaderDefaults = (
    options: StartExpressServerOptions, templateOptions: TemplateOptions = {}
): HbsHeader => {
    const stylesheets = [
        { path: "/stylesheets/global.css" }
    ];
    if (!options.production) {
        stylesheets.push({ path: "/stylesheets/debug.css" });
    }
    const header: HbsHeader = {
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
        header.stylesheets.push({ path: "/stylesheets/error.css" });
    }
    if (templateOptions.sockets) {
        header.scripts.push({ path: "/socket.io/socket.io.js" });
    }
    if (templateOptions.marktexRenderer) {
        header.stylesheets.push(
            { path: "/katex/katex.min.css" },
            { path: "/hljs/default.css" },
            { path: "/githubmdcss/github-markdown.css" },
            { path: "/stylesheets/markdown.css" }
        );
    }
    return header;
};
