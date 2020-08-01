import "./webpackVars";
import * as apiRequests from "./apiRequests";
import * as helper from "./helper";
import * as notifications from "./notifications";
import handlebarsRenderer from "./handlebarsRenderer";


window.addEventListener("load", () => {

    const accountId = helper.stringToNumberSafe(helper.getMetaInformation("accountId"));
    console.warn("accountId", accountId);
    const groupId = helper.stringToNumberSafe(helper.getMetaInformation("groupId"));
    console.warn("groupId", groupId);

    // Buttons/Inputs
    const buttonMemberAdd = document.getElementById("button-member-add");
    const inputMemberAddName = document.getElementById("input-member-add-name") as HTMLInputElement|null;
    const inputMemberAddWriteAccess = document.getElementById("input-member-add-write-access") as HTMLInputElement|null;

    const classNameButtonsMemberRemove = "button-remove-member";
    const classNameButtonsMemberToggleWriteAccess ="button-update-write-access";


    // Member handling
    // -------------------------------------------------------------------------

    const getEventListenerMemberRemove = (buttonMemberRemove: Element) => async (): Promise<void> => {
        const memberId = Number(buttonMemberRemove.getAttribute("memberId"));
        const memberAccountName = buttonMemberRemove.getAttribute("memberAccountName");
        try {
            if (accountId === undefined) {
                throw Error("No account id was found");
            }
            if (groupId === undefined) {
                throw Error("No group id was found");
            }
            if (isNaN(memberId)) {
                throw Error(`Member id is not a number (${memberId})`);
            }
            await apiRequests.groupAccess.remove({
                id: memberId
            });
            await notifications.show({
                body: memberAccountName !== null ? memberAccountName : undefined,
                title: "Group access was removed"
            });
            if (buttonMemberRemove.parentNode && buttonMemberRemove.parentNode.parentNode) {
                buttonMemberRemove.parentNode.parentNode.removeChild(buttonMemberRemove.parentNode);
            }
        } catch (err) {
            await notifications.showError(
                `Something went wrong when removing the group access of '${JSON.stringify(memberAccountName)}'`, err
            );
        }
    };

    for (const buttonMemberRemove of document.getElementsByClassName(classNameButtonsMemberRemove)) {
        buttonMemberRemove.addEventListener("click", getEventListenerMemberRemove(buttonMemberRemove));
    }

    const getEventListenerMemberToggleWriteAccess = (buttonToggle: Element) => async (): Promise<void> => {
        const memberId = Number(buttonToggle.getAttribute("memberId"));
        const memberAccountName = buttonToggle.getAttribute("memberAccountName");
        const memberWriteAccess = buttonToggle.getAttribute("memberWriteAccess") === "true";
        try {
            if (accountId === undefined) {
                throw Error("No account id was found");
            }
            if (groupId === undefined) {
                throw Error("No group id was found");
            }
            if (isNaN(memberId)) {
                throw Error(`Member id is not a number (${memberId})`);
            }
            const response = await apiRequests.groupAccess.update({
                id: memberId,
                writeAccess: !memberWriteAccess
            });
            await notifications.show({
                body: `Write access of '${JSON.stringify(memberAccountName)}' is now ${response.writeAccess}`,
                title: "Group access was updated"
            });
            buttonToggle.textContent = response.writeAccess ? "read-write" : "read-only";
            buttonToggle.setAttribute("memberWriteAccess", `${response.writeAccess}`);
        } catch (err) {
            await notifications.showError(
                `Something went wrong when updating the group access of '${JSON.stringify(memberAccountName)}'`, err
            );
        }
    };

    for (const buttonMemberToggle of document.getElementsByClassName(classNameButtonsMemberToggleWriteAccess)) {
        buttonMemberToggle.addEventListener("click", getEventListenerMemberToggleWriteAccess(buttonMemberToggle));
    }

    if (buttonMemberAdd && inputMemberAddName && inputMemberAddWriteAccess ) {
        buttonMemberAdd.addEventListener("click", async () => {
            try {
                if (accountId === undefined) {
                    throw Error("No account id was found");
                }
                if (groupId === undefined) {
                    throw Error("No group id was found");
                }
                const response = await apiRequests.groupAccess.addName({
                    accountName: inputMemberAddName.value,
                    groupId,
                    writeAccess: inputMemberAddWriteAccess.checked
                });
                await notifications.show({
                    body: `${inputMemberAddName.value} is now member of group`,
                    title: "Account was added as member"
                });
                const elementList = document.getElementById("element-list-members") as HTMLElement;
                elementList.appendChild(handlebarsRenderer.access.createMember({
                    accountId: response.accountId,
                    accountName: response.accountName,
                    id: response.id,
                    writeAccess: response.writeAccess
                }, (sandboxDoc) => {
                    // Add event listeners to latest element in sandbox
                    for (const button of sandboxDoc.getElementsByClassName(classNameButtonsMemberToggleWriteAccess)) {
                        button.addEventListener("click", getEventListenerMemberToggleWriteAccess(button));
                    }
                    for (const button of sandboxDoc.getElementsByClassName(classNameButtonsMemberRemove)) {
                        button.addEventListener("click", getEventListenerMemberRemove(button));
                    }
                }));
            } catch (err) {
                await notifications.showError("Something went wrong when adding a new member", err);
            }
        });
    }

});
