import "../webpackVars";
import * as general from "./general";
import handlebars from "handlebars";
import templateGroupEntryText from "raw-loader!../../../views/partials/group_entry.hbs";

/** Compiled handlebars template for the creation of an access entry member */
const compliedTemplateEntry = handlebars.compile(templateGroupEntryText);

export interface GroupEntry {
    /** Unique group id */
    id: number
    /** Name of group */
    name: string
}

/**
 * Create child node for one group entry
 *
 * @param input Information for template to render
 * @param funcSandbox Function that can add events to the rendered HTML elements that are preserved when returned
 * @returns Child node that contains the rendered contents
 */
export const createEntry = (input: GroupEntry, funcSandbox?: (element: HTMLElement) => void): ChildNode =>
    general.createChildNode(compliedTemplateEntry(input), funcSandbox);
