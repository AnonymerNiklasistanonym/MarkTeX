import "./webpackVars";
import type * as api from "../../routes/api";
import * as apiRequests from "./apiRequests";
import * as helper from "./helper";
import * as notifications from "./notifications";


// eslint-disable-next-line complexity
window.addEventListener("load", () => {

    const accountId = helper.stringToNumberSafe(helper.getMetaInformation("accountId"));
    console.warn("accountId", accountId);

    // Buttons
    const buttonDocumentCreate = document.getElementById("button-document-new");
    const buttonDocumentImportJson = document.getElementById("button-document-import-json");
    const inputDocumentImportJson = document.getElementById("input-document-import-json") as HTMLInputElement|null;
    const buttonGroupCreate = document.getElementById("button-group-new");
    const buttonFriendAdd = document.getElementById("button-friend-add");

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
        let jsonData: api.document.types.CreateRequest|undefined;
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

    // for (const buttonFriendRemove of buttonsFriendRemove) {
    //     buttonFriendRemove.addEventListener("click", async () => {
    //         const friendId = Number(buttonFriendRemove.getAttribute("friendId"));
    //         const friendName = buttonFriendRemove.getAttribute("friendName");
    //         try {
    //             if (accountId === undefined) {
    //                 throw Error("No account id was found");
    //             }
    //             if (isNaN(friendId)) {
    //                 throw Error(`Friend id is not a number (${friendId})`);
    //             }
    //             await apiRequests.accountFriend.remove({
    //                 id: friendId
    //             });
    //             await notifications.show({
    //                 body: friendName,
    //                 title: "Friend was removed"
    //             });
    //             if (buttonFriendRemove.parentNode && buttonFriendRemove.parentNode.parentNode) {
    //                 buttonFriendRemove.parentNode.parentNode.removeChild(buttonFriendRemove.parentNode);
    //             }
    //         } catch (err) {
    //             await notifications.showError(`Something went wrong when removing the friend ${friendName}`, err);
    //         }
    //     });
    // }

    // if (buttonFriendAdd) {
    //     buttonFriendAdd.addEventListener("click", async () => {
    //         try {
    //             if (accountId === undefined) {
    //                 throw Error("No account id was found");
    //             }
    //             // TODO
    //             const apiResponse = await apiRequests.accountFriend.add({
    //                 name: `New group (${new Date().toISOString().substring(0, 10)})`,
    //                 owner: accountId
    //             });
    //             await notifications.show({
    //                 body: `${apiResponse.name}`,
    //                 onClickUrl: `/document/${apiResponse.id}`,
    //                 title: "New group was created"
    //             });
    //             // Redirect user to document page
    //             window.location.href = `/group/${apiResponse.id}`;
    //         } catch (err) {
    //             await notifications.showError("Something went wrong when creating a new group", err);
    //         }
    //     });
    // }

});
