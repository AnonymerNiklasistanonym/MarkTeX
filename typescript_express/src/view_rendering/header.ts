
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
