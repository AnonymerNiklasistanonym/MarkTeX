import { SafeString } from "handlebars";

export interface HbsHelperItem {
    /**
     * Identifier of helper in other partials/templates
     */
    name: string
    /**
     * Function that should be executed
     */
    callback: (input: string | undefined | null) => SafeString
}

/**
 * Custom hbs helpers
 */
export const hbsHelpers: HbsHelperItem[] = [{
    callback: (input): SafeString => {
        if (input !== undefined && input !== null && input !== "") {
            return new SafeString(`${input}<br>Yes it is!`);
        } else {
            return new SafeString("");
        }
    },
    /*
   * Replace all line breaks with a paragraph:
   * ```hbs
   * <p>{{customHelper "test"}}</p>
   * ```
   * ```html
   * <p>test<br>Yes it is!</p>
   * ```
   */
    name: "customHelper"
}];


interface HbsHeaderScripts {
    path: string
};
interface HbsHeaderStylesheets {
    path: string
};

export interface HbsHeaderWebApp {
    /** The name of the web app */
    name: string
    /** HEX color of the web app (chrome specific) */
    themeColor: string
    /** Path to web app manifest */
    manifestPath: string
};

interface HbsHeaderFaviconPng {
    /** Favicon `.png` path prefix */
    prefix: string
    /** Favicon `.png` path postfix */
    postfix: string
    /** Favicon png sizes */
    sizes: number[]
};

export interface HbsHeaderFavicon{
    /** Favicon `.ico` path */
    ico: string
    /** Favicon `.svg` path */
    svg: string
    /** Path to web app manifest */
    png: HbsHeaderFaviconPng
};

export interface HbsHeader {
    scripts: HbsHeaderScripts[]
    stylesheets: HbsHeaderStylesheets[]
    webApp: HbsHeaderWebApp
    favicon: HbsHeaderFavicon
    title: string
    description: string
    author: string
};

interface HbsLayoutErrorLink {
    link: string
    text: string
};

export interface HbsLayoutError {
    error: HbsLayoutErrorError
};

interface HbsLayoutErrorError {
    status: number
    message: string
    stack?: string
    explanation?: string
    links?: HbsLayoutErrorLink[]
};
