import "./webpackVars";
import * as apiRequests from "./apiRequests";
import * as marktexDocumentEditor from "./marktex_document_editor";
import * as notifications from "./notifications";


window.onload = (): void => {

    // Get live input/output elements
    const marktexEditor = document.getElementById("marktex-editor") as HTMLTextAreaElement;
    const liveInput = document.getElementById("marktex-input") as HTMLTextAreaElement;
    const liveOutput = document.getElementById("marktex-output") as HTMLDivElement;

    const marktexButtonBoth = document.getElementById("marktex-button-both") as HTMLElement;
    const marktexButtonEdit = document.getElementById("marktex-button-edit") as HTMLElement;
    const marktexButtonView = document.getElementById("marktex-button-view") as HTMLElement;

    // Setup live input/output elements on load
    marktexDocumentEditor.render({
        marktexEditorInput: liveInput,
        marktexEditorOutput: liveOutput
    });
    marktexDocumentEditor.enableEditorModeSwitching({
        bothButton: marktexButtonBoth,
        marktexEditor,
        onlyEditButton: marktexButtonEdit,
        onlyViewButton: marktexButtonView
    });
    marktexDocumentEditor.enableEditorRendering({
        marktexEditorInput: liveInput,
        marktexEditorOutput: liveOutput
    });

    // Get document metadata
    const documentId = 2;

    // Add button functionalities
    const buttonExportPdf = document.getElementById("document-button-export-pdf") as HTMLButtonElement;
    buttonExportPdf.addEventListener("click", (): void => {
        apiRequests.document.getPdf({ id: documentId });
    });
    const buttonExportZip = document.getElementById("document-button-export-zip") as HTMLButtonElement;
    buttonExportZip.addEventListener("click", (): void => {
        apiRequests.document.getZip({ id: documentId });
    });
    const buttonExportJson = document.getElementById("document-button-export-json") as HTMLButtonElement;
    buttonExportJson.addEventListener("click", (): void => {
        apiRequests.document.getJson({ id: documentId });
    });
    const inputImportJson = document.getElementById("document-input-import-json") as HTMLInputElement;
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
    const buttonImportJson = document.getElementById("document-button-import-json") as HTMLButtonElement;
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
                onClick: () => { window.open(`/document/${response.id}`); },
                title: `Document was imported: ${response.title}`
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }, false);
    const buttonSave = document.getElementById("document-button-save") as HTMLButtonElement;
    buttonSave.addEventListener("click", (): void => {
        apiRequests.document.update({
            authors: "TODO",
            content: liveInput.value,
            date: "TODO",
            id: documentId,
            title: "TODO"
        });
    });

};
