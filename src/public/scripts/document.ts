import "./webpackVars";
import * as apiRequests from "./apiRequests";
import * as collaborationTextEditor from "./collaboration_text_editor";
import * as download from "./download";
import * as helper from "./helper";
import * as marktexDocumentEditor from "./marktex_document_editor";
import * as notifications from "./notifications";
import { PdfOptions, PdfOptionsPaperSize } from "../../modules/api/databaseManager/documentPdfOptions";
import handlebarsRenderer from "./handlebarsRenderer";
import { io } from "socket.io-client";


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


// eslint-disable-next-line complexity
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

    const classNameButtonsMemberRemove = "button-remove-member";
    const classNameButtonsMemberToggleWriteAccess = "button-update-write-access";

    const marktexButtonBoth = document.getElementById("marktex-button-both");
    const marktexButtonEdit = document.getElementById("marktex-button-edit");
    const marktexButtonView = document.getElementById("marktex-button-view");

    const documentInfoTitle = document.getElementById("document-info-title") as HTMLInputElement|null;
    const documentInfoDate = document.getElementById("document-info-date") as HTMLInputElement|null;
    const documentInfoAuthors = document.getElementById("document-info-authors") as HTMLInputElement|null;
    const documentInfoPublic = document.getElementById("document-info-public") as HTMLInputElement|null;

    // Setup live input/output elements on load
    marktexDocumentEditor.render({
        marktexEditorInput: liveInput,
        marktexEditorOutput: liveOutput
    });
    if (marktexButtonBoth && marktexEditor && marktexButtonEdit && marktexButtonView) {
        marktexDocumentEditor.enableEditorModeSwitching({
            bothButton: marktexButtonBoth,
            marktexEditor,
            onlyEditButton: marktexButtonEdit,
            onlyViewButton: marktexButtonView,
            selectedButtonClass: "selected"
        });
    }
    marktexDocumentEditor.enableEditorRendering({
        marktexEditorInput: liveInput,
        marktexEditorOutput: liveOutput
    });

    // Add button functionalities
    const buttonExportPdf = document.getElementById("document-button-export-pdf");
    if (buttonExportPdf) {
        buttonExportPdf.addEventListener("click", async () => {
            if (documentId === undefined) {
                throw Error("No document id was found");
            }
            const response = await apiRequests.document.getPdf({ id: documentId });
            download.saveAsBinary(response.pdfData, "application/pdf", `document_${response.id}.pdf`);
        });
    }
    const buttonExportZip = document.getElementById("document-button-export-zip");
    if (buttonExportZip) {
        buttonExportZip.addEventListener("click", async () => {
            if (documentId === undefined) {
                throw Error("No document id was found");
            }
            const response = await apiRequests.document.getZip({ id: documentId });
            download.saveAsBinary(response.zipData, " application/zip", `document_${response.id}.zip`);
        });
    }
    const buttonExportJson = document.getElementById("document-button-export-json");
    if (buttonExportJson) {
        buttonExportJson.addEventListener("click", async () => {
            if (documentId === undefined) {
                throw Error("No document id was found");
            }
            const response = await apiRequests.document.getJson({ id: documentId });
            download.saveAsPlainText(JSON.stringify(response.jsonData, null, 4), "application/json",
                `backup_document_${response.id}.json`);
        });
    }
    const buttonUpdateCreate = document.getElementById("document-button-update-create");
    if (buttonUpdateCreate && documentInfoAuthors && documentInfoDate && documentInfoTitle) {
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
                    body: `New document "${response.title}" by "${JSON.stringify(response.authors)}" from "${
                        JSON.stringify(response.date)}"`,
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
    const buttonUpdate = document.getElementById("document-button-update");
    if (buttonUpdate && documentInfoAuthors && documentInfoDate && documentInfoPublic && documentInfoTitle) {
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
                public: documentInfoPublic.checked,
                title: documentInfoTitle.value
            });
            await notifications.show({
                body: `Document was saved ${response.title} by ${JSON.stringify(response.authors)} from ${
                    JSON.stringify(response.date)}`,
                title: `Document was saved: ${response.title}`
            });
            documentTitleSpan.innerText = response.title;
            documentAuthorsSpan.innerText = response.authors ? `by ${response.authors}` : "";
        });
    }
    const buttonRemove = document.getElementById("document-button-remove");
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

    const toggleMetadata = document.getElementById("document-button-edit-metadata");
    const togglePdfOptions = document.getElementById("document-button-edit-pdf-options");
    const toggleMembers = document.getElementById("document-button-edit-members");
    const sectionMetadata = document.getElementById("section-document-metadata");
    const sectionPdfOptions = document.getElementById("section-document-pdf-options");
    const sectionMembers = document.getElementById("section-document-members");
    if (toggleMetadata && sectionMetadata) {
        toggleMetadata.addEventListener("click", () => { sectionMetadata.classList.toggle("hide-element"); });
    }
    if (togglePdfOptions && sectionPdfOptions) {
        togglePdfOptions.addEventListener("click", () => { sectionPdfOptions.classList.toggle("hide-element"); });
    }
    if (toggleMembers && sectionMembers) {
        toggleMembers.addEventListener("click", () => { sectionMembers.classList.toggle("hide-element"); });
    }

    const collaborationButton = document.getElementById("collaboration-button") as HTMLUListElement|null;
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

    const getEventListenerMemberRemove = (buttonMemberRemove: Element) => async (): Promise<void> => {
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
                `Something went wrong when removing the document access of '${JSON.stringify(memberAccountName)}'`, err
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
            if (documentId === undefined) {
                throw Error("No document id was found");
            }
            if (isNaN(memberId)) {
                throw Error(`Member id is not a number ('${JSON.stringify(memberId)}')`);
            }
            const response = await apiRequests.documentAccess.update({
                id: memberId,
                writeAccess: !memberWriteAccess
            });
            await notifications.show({
                body: `Write access of '${JSON.stringify(memberAccountName)}' is now ${response.writeAccess}`,
                title: "Document access was updated"
            });
            buttonToggle.textContent = response.writeAccess ? "read-write" : "read-only";
            buttonToggle.setAttribute("memberWriteAccess", `${response.writeAccess}`);
        } catch (err) {
            await notifications.showError(
                `Something went wrong when updating the document access of '${JSON.stringify(memberAccountName)}'`, err
            );
        }
    };

    for (const buttonMemberToggle of document.getElementsByClassName(classNameButtonsMemberToggleWriteAccess)) {
        buttonMemberToggle.addEventListener(
            "click", getEventListenerMemberToggleWriteAccess(buttonMemberToggle)
        );
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
                const response = await apiRequests.documentAccess.addName({
                    accountName: inputMemberAddName.value,
                    documentId,
                    writeAccess: inputMemberAddWriteAccess.checked
                });
                await notifications.show({
                    body: `${inputMemberAddName.value} is now member of document`,
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
