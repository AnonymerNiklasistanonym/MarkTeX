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
