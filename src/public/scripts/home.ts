import "./webpackVars";
import * as apiRequests from "./apiRequests";
import * as notifications from "./notifications";
import { connectToSocket } from "./sockets";



window.addEventListener("load", (): void => {

    // Connect to socket server
    connectToSocket();

    // If existing enable add document button
    const buttonAddDocument = document.getElementById("document-button-add") as HTMLAnchorElement ;
    if (buttonAddDocument) {
        buttonAddDocument.addEventListener("click", async () => {
            try {
                const response = await apiRequests.document.create({
                    content: "",
                    date: new Date().toDateString(),
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
        });
    }

    // If existing enable account delete button
    const buttonDeleteAccount = document.getElementById("account-button-remove") as HTMLAnchorElement;
    const formInputUpdateAccountId = document.getElementById("form-account-id") as HTMLInputElement;
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

    const inputImportJson = document.getElementById("document-input-import-json") as HTMLInputElement;
    const buttonImportJson = document.getElementById("document-button-import-json") as HTMLButtonElement;

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
            try {
                // eslint-disable-next-line no-console
                console.log("Found JSON data:", jsonData);
                const response = await apiRequests.document.create({
                    authors: jsonData.authors,
                    content: jsonData.content,
                    date: jsonData.date,
                    title: jsonData.title
                });
                await notifications.show({
                    body: `New document was created ${response.title} by ${response.authors} from ${response.date}`,
                    onClickUrl: `/document/${response.id}`,
                    title: `Document was imported: ${response.title}`
                });
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
        }, false);
    }

});
