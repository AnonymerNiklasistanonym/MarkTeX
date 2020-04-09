import "./webpackVars";
import * as apiRequests from "./apiRequests";
import * as collaborationTextEditor from "./collaboration_text_editor";
import * as download from "./download";
import * as helper from "./helper";
import * as marktexDocumentEditor from "./marktex_document_editor";
import * as notifications from "./notifications";
import { PdfOptions, PdfOptionsPaperSize } from "../../modules/api/databaseManager/documentPdfOptions";


const getDocumentPdfOptions = (): PdfOptions => {
    const idPrefix = "input-pdf-options-";
    const documentPdfOptionUseTitle = document.getElementById(idPrefix + "use-title") as HTMLInputElement;
    const documentPdfOptionUseAuthors = document.getElementById(idPrefix + "use-authors") as HTMLInputElement;
    const documentPdfOptionUseDate = document.getElementById(idPrefix + "use-date") as HTMLInputElement;
    const documentPdfOptionTableOfContents = document.getElementById(
        idPrefix + "table-of-contents"
    ) as HTMLInputElement;
    const documentPdfOptionTableOfContentsDepth = document.getElementById(
        idPrefix + "table-of-contents-depth"
    ) as HTMLInputElement;
    const documentPdfOptionPageNumbers = document.getElementById(idPrefix + "page-numbers") as HTMLInputElement;
    const documentPdfOptionPageSizeA4 = document.getElementById(idPrefix + "a4-paper") as HTMLInputElement;
    const documentPdfOptionIsPresentation = document.getElementById(idPrefix + "is-presentation") as HTMLInputElement;
    const documentPdfOptionTwoColumns = document.getElementById(idPrefix + "two-columns") as HTMLInputElement;
    const documentPdfOptionLandscape = document.getElementById(idPrefix + "landscape") as HTMLInputElement;
    return {
        isPresentation: documentPdfOptionIsPresentation.checked,
        landscape: documentPdfOptionLandscape.checked,
        pageNumbers: documentPdfOptionPageNumbers.checked,
        paperSize: documentPdfOptionPageSizeA4.checked ? PdfOptionsPaperSize.A4 : undefined,
        tableOfContents: {
            depth: Number(documentPdfOptionTableOfContentsDepth.value),
            enabled: documentPdfOptionTableOfContents.checked
        },
        twoColumns: documentPdfOptionTwoColumns.checked,
        useAuthors: documentPdfOptionUseAuthors.checked,
        useDate: documentPdfOptionUseDate.checked,
        useTitle: documentPdfOptionUseTitle.checked
    };
};


window.addEventListener("load", () => {

    const accountId = helper.stringToNumberSafe(helper.getMetaInformation("accountId"));
    console.warn("accountId", accountId);
    const documentId = helper.stringToNumberSafe(helper.getMetaInformation("documentId"));
    console.warn("documentId", documentId);

    // Get live input/output elements
    const marktexEditor = document.getElementById("marktex-editor") as HTMLTextAreaElement;
    const liveInput = document.getElementById("marktex-input") as HTMLTextAreaElement;
    const liveOutput = document.getElementById("marktex-output") as HTMLDivElement;

    const documentTitleSpan = document.getElementById("document-title") as HTMLSpanElement;
    const documentAuthorsSpan = document.getElementById("document-authors") as HTMLSpanElement;

    // Buttons/Inputs
    const buttonMemberAdd = document.getElementById("button-member-add");
    const inputMemberAddName = document.getElementById("input-member-add-name") as HTMLInputElement|null;
    const inputMemberAddWriteAccess = document.getElementById("input-member-add-write-access") as HTMLInputElement|null;

    const buttonsMemberRemove = document.getElementsByClassName("button-remove-member");
    const buttonsMemberToggleWriteAccess = document.getElementsByClassName("button-update-write-access");

    const marktexButtonBoth = document.getElementById("marktex-button-both") as HTMLAnchorElement;
    const marktexButtonEdit = document.getElementById("marktex-button-edit") as HTMLAnchorElement;
    const marktexButtonView = document.getElementById("marktex-button-view") as HTMLAnchorElement;

    // const documentInfoId = document.getElementById("document-info-id") as HTMLInputElement;
    // const documentInfoIdOwner = document.getElementById("document-info-id-owner") as HTMLInputElement;
    // const documentInfoIdGroup = document.getElementById("document-info-id-group") as HTMLInputElement;
    const documentInfoTitle = document.getElementById("document-info-title") as HTMLInputElement;
    const documentInfoDate = document.getElementById("document-info-date") as HTMLInputElement;
    const documentInfoAuthors = document.getElementById("document-info-authors") as HTMLInputElement;

    // Setup live input/output elements on load
    marktexDocumentEditor.render({
        marktexEditorInput: liveInput,
        marktexEditorOutput: liveOutput
    });
    marktexDocumentEditor.enableEditorModeSwitching({
        bothButton: marktexButtonBoth,
        marktexEditor,
        onlyEditButton: marktexButtonEdit,
        onlyViewButton: marktexButtonView,
        selectedButtonClass: "selected"
    });
    marktexDocumentEditor.enableEditorRendering({
        marktexEditorInput: liveInput,
        marktexEditorOutput: liveOutput
    });

    // Add button functionalities
    const buttonExportPdf = document.getElementById("document-button-export-pdf") as HTMLButtonElement;
    buttonExportPdf.addEventListener("click", async () => {
        if (documentId === undefined) {
            throw Error("No document id was found");
        }
        const response = await apiRequests.document.getPdf({ id: documentId });
        download.saveAsBinary(response.pdfData, "application/pdf", `document_${response.id}.pdf`);
    });
    const buttonExportZip = document.getElementById("document-button-export-zip") as HTMLButtonElement;
    buttonExportZip.addEventListener("click", async () => {
        if (documentId === undefined) {
            throw Error("No document id was found");
        }
        const response = await apiRequests.document.getZip({ id: documentId });
        download.saveAsBinary(response.zipData, " application/zip", `document_${response.id}.zip`);
    });
    const buttonExportJson = document.getElementById("document-button-export-json") as HTMLButtonElement;
    buttonExportJson.addEventListener("click", async () => {
        if (documentId === undefined) {
            throw Error("No document id was found");
        }
        const response = await apiRequests.document.getJson({ id: documentId });
        download.saveAsPlainText(JSON.stringify(response.jsonData, null, 4), "application/json",
            `backup_document_${response.id}.json`);
    });
    const buttonUpdateCreate = document.getElementById("document-button-update-create") as HTMLButtonElement;
    if (buttonUpdateCreate) {
        buttonUpdateCreate.addEventListener("click", async () => {
            if (!(accountId)) {
                throw Error("No account id was found");
            }
            const response = await apiRequests.document.create({
                authors: documentInfoAuthors.value,
                content: liveInput.value,
                date: documentInfoDate.value,
                owner: accountId,
                pdfOptions: getDocumentPdfOptions(),
                title: documentInfoTitle.value
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
        });
    }
    const buttonUpdate = document.getElementById("document-button-update") as HTMLButtonElement;
    if (buttonUpdate) {
        buttonUpdate.addEventListener("click", async () => {
            if (!(documentId)) {
                throw Error("No document id was found");
            }
            const response = await apiRequests.document.update({
                authors: documentInfoAuthors.value,
                content: liveInput.value,
                date: documentInfoDate.value,
                id: documentId,
                pdfOptions: getDocumentPdfOptions(),
                title: documentInfoTitle.value
            });
            await notifications.show({
                body: `Document was saved ${response.title} by ${response.authors} from ${response.date}`,
                title: `Document was saved: ${response.title}`
            });
            documentTitleSpan.innerText = response.title;
            documentAuthorsSpan.innerText = response.authors ? `by ${response.authors}` : "";
        });
    }
    const buttonRemove = document.getElementById("document-button-remove") as HTMLButtonElement;
    if (buttonRemove) {
        buttonRemove.addEventListener("click", async () => {
            if (!(documentId)) {
                throw Error("No document id was found");
            }
            const response = await apiRequests.document.remove({ id: documentId });
            if (response) {
                await notifications.show({
                    body: `Document was deleted ${"TODO"} by ${"TODO"} from ${"TODO"}`,
                    title: `Document was deleted: ${"TODO"}`
                });
                // Redirect user to home page since the document was removed
                window.location.href = "/";
            }
        });
    }

    const toggleMetadata = document.getElementById("document-button-edit-metadata") as HTMLElement;
    const togglePdfOptions = document.getElementById("document-button-edit-pdf-options") as HTMLElement;
    const toggleMembers = document.getElementById("document-button-edit-members") as HTMLElement;
    const sectionMetadata = document.getElementById("section-document-metadata") as HTMLElement;
    const sectionPdfOptions = document.getElementById("section-document-pdf-options") as HTMLElement;
    const sectionMembers = document.getElementById("section-document-members") as HTMLElement;
    toggleMetadata.addEventListener("click", () => { sectionMetadata.classList.toggle("hide-element"); });
    togglePdfOptions.addEventListener("click", () => { sectionPdfOptions.classList.toggle("hide-element"); });
    toggleMembers.addEventListener("click", () => { sectionMembers.classList.toggle("hide-element"); });


    const collaborationButton = document.getElementById("collaboration-button") as HTMLUListElement;
    if (collaborationButton) {
        let collaborationEnabled = false;
        collaborationButton.addEventListener("click", () => {
            if (documentId === undefined) {
                throw Error("No document id was found");
            }
            if (collaborationEnabled) {
                collaborationTextEditor.disable();
                collaborationButton.innerText = "Enable collaboration [Beta]";
                collaborationEnabled = false;
            } else {
                collaborationEnabled = true;
                const socket = io();
                collaborationTextEditor.enable(socket, documentId, {
                    connectedUsersElement: document.getElementById("connected-users") as HTMLUListElement,
                    connectedUsersList: document.getElementById("connected-users-list") as HTMLUListElement,
                    textInput: liveInput
                });
                collaborationButton.innerText = "Disable collaboration [Beta]";
            }
        });
    }

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
                if (documentId === undefined) {
                    throw Error("No document id was found");
                }
                if (isNaN(memberId)) {
                    throw Error(`Member id is not a number (${memberId})`);
                }
                await apiRequests.documentAccess.remove({
                    id: memberId
                });
                await notifications.show({
                    body: memberAccountName !== null ? memberAccountName : undefined,
                    title: "Document access was removed"
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

    for (const buttonMemberToggleWriteAccess of buttonsMemberToggleWriteAccess) {
        buttonMemberToggleWriteAccess.addEventListener("click", async () => {
            const memberId = Number(buttonMemberToggleWriteAccess.getAttribute("memberId"));
            const memberAccountName = buttonMemberToggleWriteAccess.getAttribute("memberAccountName");
            const memberWriteAccess = buttonMemberToggleWriteAccess.getAttribute("memberWriteAccess") === "true";
            try {
                if (accountId === undefined) {
                    throw Error("No account id was found");
                }
                if (documentId === undefined) {
                    throw Error("No document id was found");
                }
                if (isNaN(memberId)) {
                    throw Error(`Member id is not a number (${memberId})`);
                }
                const response = await apiRequests.documentAccess.update({
                    id: memberId,
                    writeAccess: !memberWriteAccess
                });
                await notifications.show({
                    body: `Write access of '${memberAccountName}' is now ${response.writeAccess}`,
                    title: "Document access was updated"
                });
                buttonMemberToggleWriteAccess.textContent = response.writeAccess ? "read-write" : "read-only";
                buttonMemberToggleWriteAccess.setAttribute("memberWriteAccess", `${response.writeAccess}`);
            } catch (err) {
                await notifications.showError(
                    `Something went wrong when updating the access of ${memberAccountName}`, err
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
                if (documentId === undefined) {
                    throw Error("No group id was found");
                }
                await apiRequests.documentAccess.addName({
                    accountName: inputMemberAddName.value,
                    documentId,
                    writeAccess: inputMemberAddWriteAccess.checked
                });
                await notifications.show({
                    body: `${inputMemberAddName.value} is now member of document`,
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
