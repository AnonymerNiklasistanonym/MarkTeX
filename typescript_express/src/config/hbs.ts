import { SafeString } from "handlebars";

export interface HbsHelperItem {
    /**
     * Identifier of helper in other partials/templates
     */
    name: string;
    /**
     * Function that should be executed
     */
    callback: (input: string | undefined | null) => SafeString | undefined;
}

/**
 * Custom hbs helpers
 */
export const hbsHelpers: HbsHelperItem[] = [{
  /**
   * Replace all line breaks with a paragraph
   * @param {string} input
   * @example
   * ```hbs
   * {{error_explanation_helper "explanation"}}
   * ```
   * ```html
   * <p id="explanation">explanation</p>
   * ```
   */
  callback: input => {
    if (input !== undefined && input !== null && input !== "") {
      return new SafeString(`${input}<br>Yes it is!`);
    } else {
      return undefined;
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
