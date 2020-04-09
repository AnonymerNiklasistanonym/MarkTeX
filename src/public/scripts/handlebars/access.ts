import handlebars from "handlebars";


const templateMember = "<li>"
 + "<a class=\"button\" href=\"/account/{{this.accountId}}\">{{this.accountName}}</a>"
 + "<a class=\"button button-update button-update-write-access\" memberId=\"{{this.id}}\""
 + "memberAccountName=\"{{this.accountName}}\" memberWriteAccess=\"{{this.writeAccess}}\">"
 + "{{#if this.writeAccess}}read-write{{else}}read-only{{/if}}</a>"
 + "<a class=\"button button-remove button-remove-member\" memberId=\"{{this.id}}\""
 + "memberAccountName=\"{{this.accountName}}\">Remove</a>"
 + "</li>";

const compliedTemplateMember = handlebars.compile(templateMember);

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
