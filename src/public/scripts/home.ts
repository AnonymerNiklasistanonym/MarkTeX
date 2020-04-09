import "./webpackVars";
import type * as api from "../../routes/api";
import * as apiRequests from "./apiRequests";
import * as helper from "./helper";
import * as notifications from "./notifications";


// eslint-disable-next-line complexity
window.addEventListener("load", () => {

    const accountId = helper.stringToNumberSafe(helper.getMetaInformation("accountId"));
    console.warn("accountId", accountId);

    // Buttons/Inputs
    const buttonDocumentCreate = document.getElementById("button-document-new");
    const buttonDocumentImportJson = document.getElementById("button-document-import-json");
    const inputDocumentImportJson = document.getElementById("input-document-import-json") as HTMLInputElement|null;
    const buttonGroupCreate = document.getElementById("button-group-new");
    const buttonFriendAdd = document.getElementById("button-friend-add");
    const inputFriendAdd = document.getElementById("input-friend-add") as HTMLInputElement|null;
    const buttonAccountUpdate = document.getElementById("button-account-update");
    const inputAccountUpdatePassword = document.getElementById(
        "input-account-update-password"
    )  as HTMLInputElement|null;
    const inputAccountUpdateName = document.getElementById("input-account-update-name")  as HTMLInputElement|null;
    const inputAccountUpdateNewPassword = document.getElementById(
        "input-account-update-new-password"
    ) as HTMLInputElement|null;
    const inputAccountUpdatePublic = document.getElementById("input-account-update-public") as HTMLInputElement|null;
    const buttonAccountRemove = document.getElementById("button-account-remove");

    const buttonsDocumentRemove = document.getElementsByClassName("button-remove-document");
    const buttonsGroupRemove = document.getElementsByClassName("button-remove-group");
    const buttonsFriendRemove = document.getElementsByClassName("button-remove-friend");

    // Document handling
    // -------------------------------------------------------------------------

    for (const buttonDocumentRemove of buttonsDocumentRemove) {
        buttonDocumentRemove.addEventListener("click", async () => {
            const documentId = Number(buttonDocumentRemove.getAttribute("documentId"));
            const documentName = buttonDocumentRemove.getAttribute("documentName");
            try {
                if (accountId === undefined) {
                    throw Error("No account id was found");
                }
                if (isNaN(documentId)) {
                    throw Error(`Document id is not a number (${documentId})`);
                }
                await apiRequests.document.remove({
                    id: documentId
                });
                await notifications.show({
                    body: documentName !== null ? documentName : undefined,
                    title: "Document was removed"
                });
                if (buttonDocumentRemove.parentNode && buttonDocumentRemove.parentNode.parentNode) {
                    buttonDocumentRemove.parentNode.parentNode.removeChild(buttonDocumentRemove.parentNode);
                }
            } catch (err) {
                await notifications.showError(`Something went wrong when removing the document ${documentName}`, err);
            }
        });
    }

    if (buttonDocumentCreate) {
        buttonDocumentCreate.addEventListener("click", async () => {
            try {
                if (accountId === undefined) {
                    throw Error("No account id was found");
                }
                const apiResponse = await apiRequests.document.create({
                    content: "",
                    date: new Date().toISOString().substring(0, 10),
                    owner: accountId,
                    title: "New document"
                });
                await notifications.show({
                    body: `${apiResponse.title} by ${apiResponse.authors} from ${apiResponse.date}`,
                    onClickUrl: `/document/${apiResponse.id}`,
                    title: "New document was created"
                });
                // Redirect user to document page
                window.location.href = `/document/${apiResponse.id}`;
            } catch (err) {
                await notifications.showError("Something went wrong when creating a new document", err);
            }
        });
    }

    if (buttonDocumentImportJson && inputDocumentImportJson) {
        let jsonData: api.document.CreateRequest|undefined;
        inputDocumentImportJson.addEventListener("change", (): void => {
            const fileReader = new FileReader();
            fileReader.onload = (): void => {
                const text = String(fileReader.result);
                jsonData = JSON.parse(text);
                if (DEBUG_APP) { console.warn("Read and parsed JSON file", text, jsonData); }
                // Trigger button to import again
                buttonDocumentImportJson.click();
            };
            if (inputDocumentImportJson.files && inputDocumentImportJson.files.length > 0) {
                fileReader.readAsText(inputDocumentImportJson.files[0]);
            }
        });
        buttonDocumentImportJson.addEventListener("click", async () => {
            try {
                if (accountId === undefined) {
                    throw Error("No account id was found");
                }

                if (jsonData === undefined) {
                    if (DEBUG_APP) { console.warn("No json data was yet read"); }
                    inputDocumentImportJson.click();
                    return;
                }

                if (DEBUG_APP) { console.warn("JSON data:", jsonData); }

                const apiResponse = await apiRequests.document.create({
                    authors: jsonData.authors,
                    content: jsonData.content,
                    date: jsonData.date,
                    owner: accountId,
                    title: jsonData.title
                });
                // Clear JSON data again for another import
                jsonData = undefined;
                await notifications.show({
                    body: `${apiResponse.title} by ${apiResponse.authors} from ${apiResponse.date}`,
                    onClickUrl: `/document/${apiResponse.id}`,
                    title: "New document was created"
                });
                // TODO Render in page - currently just refreshes the page
                window.location.reload(true);
            } catch (err) {
                await notifications.showError("Something went wrong when import a document (JSON)", err);
            }
        });
    }

    // Group handling
    // -------------------------------------------------------------------------

    for (const buttonGroupRemove of buttonsGroupRemove) {
        buttonGroupRemove.addEventListener("click", async () => {
            const groupId = Number(buttonGroupRemove.getAttribute("groupId"));
            const groupName = buttonGroupRemove.getAttribute("groupName");
            try {
                if (accountId === undefined) {
                    throw Error("No account id was found");
                }
                if (isNaN(groupId)) {
                    throw Error(`Group id is not a number (${groupId})`);
                }
                await apiRequests.group.remove({
                    id: groupId
                });
                await notifications.show({
                    body: groupName !== null ? groupName : undefined,
                    title: "Group was removed"
                });
                if (buttonGroupRemove.parentNode && buttonGroupRemove.parentNode.parentNode) {
                    buttonGroupRemove.parentNode.parentNode.removeChild(buttonGroupRemove.parentNode);
                }
            } catch (err) {
                await notifications.showError(`Something went wrong when removing the group ${groupName}`, err);
            }
        });
    }

    if (buttonGroupCreate) {
        buttonGroupCreate.addEventListener("click", async () => {
            try {
                if (accountId === undefined) {
                    throw Error("No account id was found");
                }
                const apiResponse = await apiRequests.group.create({
                    name: `New group (${new Date().toISOString().substring(0, 10)})`,
                    owner: accountId
                });
                await notifications.show({
                    body: `${apiResponse.name}`,
                    onClickUrl: `/document/${apiResponse.id}`,
                    title: "New group was created"
                });
                // Redirect user to document page
                window.location.href = `/group/${apiResponse.id}`;
            } catch (err) {
                await notifications.showError("Something went wrong when creating a new group", err);
            }
        });
    }

    // Friend handling
    // -------------------------------------------------------------------------

    for (const buttonFriendRemove of buttonsFriendRemove) {
        buttonFriendRemove.addEventListener("click", async () => {
            const friendId = Number(buttonFriendRemove.getAttribute("friendId"));
            const friendName = buttonFriendRemove.getAttribute("friendName");
            try {
                if (accountId === undefined) {
                    throw Error("No account id was found");
                }
                if (!(friendName)) {
                    throw Error("No friend name was found");
                }
                if (isNaN(friendId)) {
                    throw Error(`Friend id is not a number (${friendId})`);
                }
                await apiRequests.accountFriend.remove({
                    id: friendId
                });
                await notifications.show({
                    body: friendName,
                    title: "Friend was removed"
                });
                if (buttonFriendRemove.parentNode && buttonFriendRemove.parentNode.parentNode) {
                    buttonFriendRemove.parentNode.parentNode.removeChild(buttonFriendRemove.parentNode);
                }
            } catch (err) {
                await notifications.showError(`Something went wrong when removing the friend ${friendName}`, err);
            }
        });
    }

    if (buttonFriendAdd && inputFriendAdd) {
        buttonFriendAdd.addEventListener("click", async () => {
            try {
                if (accountId === undefined) {
                    throw Error("No account id was found");
                }
                // Get account name from text input
                const apiResponse = await apiRequests.accountFriend.addName({
                    accountId, friendAccountName: inputFriendAdd.value
                });
                // TODO Add new friend entry
                await notifications.show({
                    body: `${inputFriendAdd.value}`,
                    title: "A friend was added"
                });
                // TODO Render in page - currently just refreshes the page
                window.location.reload(true);
            } catch (err) {
                await notifications.showError("Something went wrong when adding a friend", err);
            }
        });
    }

    // Account handling
    // -------------------------------------------------------------------------

    if (buttonAccountRemove) {
        buttonAccountRemove.addEventListener("click", async () => {
            try {
                if (accountId === undefined) {
                    throw Error("No account id was found");
                }
                await apiRequests.account.remove({
                    id: accountId
                });
                await notifications.show({
                    title: "Account was removed"
                });
                // Redirect user to home page
                window.location.href = "/";
            } catch (err) {
                await notifications.showError("Something went wrong when removing the account", err);
            }
        });
    }

    if (buttonAccountUpdate && inputAccountUpdatePassword && inputAccountUpdateName && inputAccountUpdateNewPassword &&
        inputAccountUpdatePublic && buttonAccountRemove) {
        buttonAccountUpdate.addEventListener("click", async () => {
            try {
                if (accountId === undefined) {
                    throw Error("No account id was found");
                }
                const apiResponse = await apiRequests.account.update({
                    currentPassword: inputAccountUpdatePassword.value,
                    id: accountId,
                    name: inputAccountUpdateName.value.length > 0
                        ? inputAccountUpdateName.value : undefined,
                    password: inputAccountUpdateNewPassword.value.length > 0
                        ? inputAccountUpdateNewPassword.value : undefined,
                    public: inputAccountUpdatePublic.checked
                });
                // TODO Check if a password is given
                await notifications.show({
                    body: `${apiResponse.name} was updated`,
                    title: "Account was updated"
                });
                // TODO Render in page - currently just refreshes the page
                window.location.reload(true);
            } catch (err) {
                await notifications.showError("Something went wrong when updating the account", err);
            }
        });
    }

});
