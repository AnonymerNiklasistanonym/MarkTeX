import "./webpackVars";
import * as apiRequests from "./apiRequests";
import * as helper from "./helper";
import * as notifications from "./notifications";


window.addEventListener("load", () => {

    const accountId = helper.stringToNumberSafe(helper.getMetaInformation("accountId"));
    console.warn("accountId", accountId);
    const groupId = helper.stringToNumberSafe(helper.getMetaInformation("groupId"));
    console.warn("groupId", groupId);

    // Buttons/Inputs
    const buttonMemberAdd = document.getElementById("button-member-add");
    const inputMemberAddName = document.getElementById("input-member-add-name") as HTMLInputElement|null;
    const inputMemberAddWriteAccess = document.getElementById("input-member-add-write-access") as HTMLInputElement|null;

    const buttonsMemberRemove = document.getElementsByClassName("button-remove-member");


    // Member handling
    // -------------------------------------------------------------------------

    for (const buttonMemberRemove of buttonsMemberRemove) {
        buttonMemberRemove.addEventListener("click", async () => {
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
                    title: "Document was removed"
                });
                if (buttonMemberRemove.parentNode && buttonMemberRemove.parentNode.parentNode) {
                    buttonMemberRemove.parentNode.parentNode.removeChild(buttonMemberRemove.parentNode);
                }
            } catch (err) {
                await notifications.showError(
                    `Something went wrong when removing the access of ${memberAccountName}`, err
                );
            }
        });
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
                await apiRequests.groupAccess.addName({
                    accountName: inputMemberAddName.value,
                    groupId,
                    writeAccess: inputMemberAddWriteAccess.checked
                });
                await notifications.show({
                    body: `${inputMemberAddName.value} is now member of group`,
                    title: "Account was added as member"
                });
                // TODO Render in page - currently just refreshes the page
                window.location.reload(true);
            } catch (err) {
                await notifications.showError("Something went wrong when adding a new member", err);
            }
        });
    }

});
