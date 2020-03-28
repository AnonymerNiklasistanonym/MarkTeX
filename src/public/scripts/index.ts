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

});
