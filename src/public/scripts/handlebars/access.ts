import "../webpackVars";
import handlebars from "handlebars";
import templateAccessMemberText from "raw-loader!../../../views/partials/access_member.hbs";


const compliedTemplateMember = handlebars.compile(templateAccessMemberText);

export interface AccessMember {
    id: number
    accountId: number
    accountName: string
    writeAccess: boolean
}

export const accessMember = (input: AccessMember): string => compliedTemplateMember(input);

/**
 * Create child node for one access member
 *
 * @param input Information for template to render
 * @param funcSandbox Function that can add events to the rendered HTML elements that are preserved when returned
 * @returns Child node that contains the rendered contents
 */
export const accessMemberChildNode = (input: AccessMember, funcSandbox?: (element: HTMLElement) => void): ChildNode => {
    const element = document.createElement("div");
    element.innerHTML = accessMember(input);
    if (funcSandbox) {
        funcSandbox(element);
    }
    if (element.firstChild) {
        return element.firstChild;
    }
    throw Error("Fatal");
};
