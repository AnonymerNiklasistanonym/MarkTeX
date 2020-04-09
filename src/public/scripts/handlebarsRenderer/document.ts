import "../webpackVars";
import * as general from "./general";
import handlebars from "handlebars";
import templateDocumentEntryText from "raw-loader!../../../views/partials/document_entry.hbs";

/** Compiled handlebars template for the creation of an access entry member */
const compliedTemplateEntry = handlebars.compile(templateDocumentEntryText);

export interface DocumentEntry {
    /** Unique document id */
    id: number
    /** Title of document */
    title: string
    /** Authors of document */
    authors?: string
    /** Date of document */
    date?: string
}

/**
 * Create child node for one document entry
 *
 * @param input Information for template to render
 * @param funcSandbox Function that can add events to the rendered HTML elements that are preserved when returned
 * @returns Child node that contains the rendered contents
 */
export const createEntry = (input: DocumentEntry, funcSandbox?: (element: HTMLElement) => void): ChildNode =>
    general.createChildNode(compliedTemplateEntry(input), funcSandbox);
