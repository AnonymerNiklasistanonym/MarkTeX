import "../webpackVars";
import * as general from "./general";
import handlebars from "handlebars";
import templateFriendEntryText from "raw-loader!../../../views/partials/friend_entry.hbs";

/** Compiled handlebars template for the creation of an access entry member */
const compliedTemplateEntry = handlebars.compile(templateFriendEntryText);

export interface FriendEntry {
    /** Unique friend entry id */
    id: number
    /** Unique id of account that is a friend */
    friendAccountId: number
    /** Unique name of account that is a friend */
    friendAccountName: string
}

/**
 * Create child node for one friend entry
 *
 * @param input Information for template to render
 * @param funcSandbox Function that can add events to the rendered HTML elements that are preserved when returned
 * @returns Child node that contains the rendered contents
 */
export const createEntry = (input: FriendEntry, funcSandbox?: (element: HTMLElement) => void): ChildNode =>
    general.createChildNode(compliedTemplateEntry(input), funcSandbox);
