import { md, renderLatexBlocks } from "./documentRenderer/markdownRenderer";
import * as apiRequests from "./apiRequests";
import "./webpackVars";


window.onload = (): void => {

    // Get live  input/output elements
    const liveInput = document.getElementById("document-content-render-input") as HTMLTextAreaElement;
    const liveOutput = document.getElementById("document-content-render-output") as HTMLDivElement;

    // Setup live input/output elements on load
    if (liveInput !== undefined && liveOutput !== undefined) {
        // Initial render
        liveOutput.innerHTML = md.render(liveInput.value, { renderTimeString: new Date().toISOString() });
        // React to new inputs
        liveInput.addEventListener("input", (): void => {
            // Update document render output
            liveOutput.innerHTML = md.render(liveInput.value, { renderTimeString: new Date().toISOString() });
            renderLatexBlocks();
        });
    }

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
                content: jsonData.content,
                title: jsonData.title,
                authors: jsonData.authors,
                date: jsonData.date
            });
            // TODO Display message
            // eslint-disable-next-line no-console
            console.log("Created new document:", response);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }, false);
    const buttonSave = document.getElementById("document-button-save") as HTMLButtonElement;
    buttonSave.addEventListener("click", (): void => {
        apiRequests.document.update({
            id: documentId,
            title: "TODO",
            authors: "TODO",
            date: "TODO",
            content: liveInput.value
        });
    });

};
