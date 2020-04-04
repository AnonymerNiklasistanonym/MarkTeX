import "./webpackVars";
import * as apiRequests from "./apiRequests";
import * as helper from "./helper";
import * as notifications from "./notifications";


window.addEventListener("load", () => {

    const accountId = helper.stringToNumberSafe(helper.getMetaInformation("accountId"));
    console.warn("accountId", accountId);

    // If existing enable add document button
    const buttonAddDocument = document.getElementById("document-button-add");
    if (buttonAddDocument) {
        buttonAddDocument.addEventListener("click", async () => {
            if (accountId) {
                try {
                    const response = await apiRequests.document.create({
                        content: "",
                        date: new Date().toDateString(),
                        owner: accountId,
                        title: "New document"
                    });
                    if (response) {
                        await notifications.show({
                            body: `New document "${response.title}" by "${response.authors}" from "${response.date}"`,
                            onClickUrl: `/document/${response.id}`,
                            title: "New document was created"
                        });
                        // Redirect user to document page
                        window.location.href = `/document/${response.id}`;
                    } else {
                        await notifications.show({
                            body: "The response was not OK",
                            title: "Error: Something went wrong when creating a new document"
                        });
                    }
                } catch (err) {
                    console.error(err);
                    await notifications.show({
                        body: (err as Error).message,
                        title: "Error: Something went wrong when creating a new document"
                    });
                }
            } else {
                await notifications.show({
                    body: "No document was created because you are not logged in",
                    onClickUrl: "/login",
                    title: "Error: Something went wrong when creating a new document"
                });
            }
        });
    }

    // If existing enable account delete button
    const buttonDeleteAccount = document.getElementById("account-button-remove");
    const formInputUpdateAccountId = document.getElementById("form-account-id") as HTMLInputElement|null;
    if (buttonDeleteAccount && formInputUpdateAccountId) {
        buttonDeleteAccount.addEventListener("click", async () => {
            try {
                const response = await apiRequests.account.remove({
                    id: formInputUpdateAccountId.valueAsNumber
                });
                if (response) {
                    // Redirect user to home page
                    window.location.href = `/document/${response.id}`;
                } else {
                    await notifications.show({
                        body: "The response was not OK",
                        title: "Error: Something went wrong when deleting the account"
                    });
                }
            } catch (err) {
                console.error(err);
                await notifications.show({
                    body: (err as Error).message,
                    title: "Error: Something went wrong when deleting the account"
                });
            }
        });
    }

    const inputImportJson = document.getElementById("document-input-import-json") as HTMLInputElement|null;
    const buttonImportJson = document.getElementById("document-button-import-json");

    if (inputImportJson && buttonImportJson) {
        let jsonData: any = {};
        inputImportJson.addEventListener("change", (): void => {
            const fileReader = new FileReader();
            fileReader.onload = (): void => {
                const text = String(fileReader.result);
                jsonData = JSON.parse(text);
                // eslint-disable-next-line no-console
                console.log("Read a JSON file:", text, jsonData);
                // TODO Verify JSON file content
            };
            if (inputImportJson.files && inputImportJson.files.length > 0) {
                fileReader.readAsText(inputImportJson.files[0]);
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        buttonImportJson.addEventListener("click", async () => {
            if (accountId) {
                try {
                    // eslint-disable-next-line no-console
                    console.log("Found JSON data:", jsonData);
                    const response = await apiRequests.document.create({
                        authors: jsonData.authors,
                        content: jsonData.content,
                        date: jsonData.date,
                        owner: accountId,
                        title: jsonData.title
                    });
                    await notifications.show({
                        body: `New document was created ${response.title} by ${response.authors} from ${response.date}`,
                        onClickUrl: `/document/${response.id}`,
                        title: `Document was imported: ${response.title}`
                    });
                } catch (e) {
                    console.error(e);
                    await notifications.show({
                        body: (e as Error).message,
                        title: "Error: Something went wrong when creating a new document"
                    });
                }
            } else {
                await notifications.show({
                    body: "You are not logged in",
                    onClickUrl: "/login",
                    title: "Error: Something went wrong when creating a new document"
                });
            }
        }, false);
    }

});
