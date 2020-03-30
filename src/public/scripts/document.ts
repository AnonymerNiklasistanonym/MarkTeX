import "./webpackVars";
import type * as api from "../../routes/api";
import * as apiRequests from "./apiRequests";
import * as download from "./download";
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

window.onload = (): void => {

    // Get live input/output elements
    const marktexEditor = document.getElementById("marktex-editor") as HTMLTextAreaElement;
    const liveInput = document.getElementById("marktex-input") as HTMLTextAreaElement;
    const liveOutput = document.getElementById("marktex-output") as HTMLDivElement;

    const documentTitleSpan = document.getElementById("document-title") as HTMLSpanElement;
    const documentAuthorsSpan = document.getElementById("document-authors") as HTMLSpanElement;

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

    // Get document metadata
    const documentId = Number(window.location.href.split("/").slice(-1)[0]);

    // Add button functionalities
    const buttonExportPdf = document.getElementById("document-button-export-pdf") as HTMLButtonElement;
    buttonExportPdf.addEventListener("click", async () => {
        const response = await apiRequests.document.getPdf({ id: documentId });
        download.saveAsBinary(response.pdfData, "application/pdf", `document_${response.id}.pdf`);
    });
    const buttonExportZip = document.getElementById("document-button-export-zip") as HTMLButtonElement;
    buttonExportZip.addEventListener("click", async () => {
        const response = await apiRequests.document.getZip({ id: documentId });
        download.saveAsBinary(response.zipData, " application/zip", `document_${response.id}.zip`);
    });
    const buttonExportJson = document.getElementById("document-button-export-json") as HTMLButtonElement;
    buttonExportJson.addEventListener("click", async () => {
        const response = await apiRequests.document.getJson({ id: documentId });
        download.saveAsPlainText(JSON.stringify(response.jsonData, null, 4), "application/json",
            `backup_document_${response.id}.json`);
    });
    const buttonUpdate = document.getElementById("document-button-update") as HTMLButtonElement;
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    buttonUpdate.addEventListener("click", async () => {
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
    const buttonRemove = document.getElementById("document-button-remove") as HTMLButtonElement;
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    buttonRemove.addEventListener("click", async () => {
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

    const toggleMetadata = document.getElementById("document-button-edit-metadata") as HTMLElement;
    const togglePdfOptions = document.getElementById("document-button-edit-pdf-options") as HTMLElement;
    const sectionMetadata = document.getElementById("section-document-metadata") as HTMLElement;
    const sectionPdfOptions = document.getElementById("section-document-pdf-options") as HTMLElement;
    toggleMetadata.addEventListener("click", () => { sectionMetadata.classList.toggle("hide-element"); });
    togglePdfOptions.addEventListener("click", () => { sectionPdfOptions.classList.toggle("hide-element"); });

};
