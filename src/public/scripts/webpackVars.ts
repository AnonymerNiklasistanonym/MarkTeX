/** Webpack defined variable that is false when in production mode */
declare const DEBUG_APP: boolean;

/** Definition to load raw file contents into webpack modules */
declare module "raw-loader!*" {
    /** Raw file content */
    const content: string;
    export default content;
}
