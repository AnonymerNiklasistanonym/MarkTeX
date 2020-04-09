import "../webpackVars";
import * as general from "./general";
import handlebars from "handlebars";
import templateAccessMemberText from "raw-loader!../../../views/partials/access_member.hbs";

/** Compiled handlebars template for the creation of an access entry member */
const compliedTemplateMember = handlebars.compile(templateAccessMemberText);

export interface AccessMember {
    /** Unique access entry id */
    id: number
    /** Unique id of account that is granted access */
    accountId: number
    /** Unique name of account that is granted access */
    accountName: string
    /** Indicator if the access is read-only or read-write */
    writeAccess: boolean
}

/**
 * Create child node for one access member
 *
 * @param input Information for template to render
 * @param funcSandbox Function that can add events to the rendered HTML elements that are preserved when returned
 * @returns Child node that contains the rendered contents
 */
export const createMember = (input: AccessMember, funcSandbox?: (element: HTMLElement) => void): ChildNode =>
    general.createChildNode(compliedTemplateMember(input), funcSandbox);
