import api from "../src/modules/api";
import chai from "chai";
import { describe } from "mocha";


describe("api pandoc [shell]", () => {
    it("create pdf", async () => {
        const pdfOutput = await api.pandoc.createPdf({
            content: "content",
            title: "title"
        });
        chai.expect(pdfOutput.pdfData.length).to.be.above(0, "Pdf not empty");
        const pdfOutputPresentation = await api.pandoc.createPdf({
            content: "content",
            pdfOptions: {
                isPresentation: true
            },
            title: "title"
        });
        chai.expect(pdfOutputPresentation.pdfData.length).to.be.above(0, "Pdf not empty");
        const pdfOutputLandscape = await api.pandoc.createPdf({
            content: "content",
            pdfOptions: {
                landscape: true
            },
            title: "title"
        });
        chai.expect(pdfOutputLandscape.pdfData.length).to.be.above(0, "Pdf not empty");
        const pdfOutputA4 = await api.pandoc.createPdf({
            content: "content",
            pdfOptions: {
                paperSize: api.pandoc.PdfOptionsPaperSize.A4
            },
            title: "title"
        });
        chai.expect(pdfOutputA4.pdfData.length).to.be.above(0, "Pdf not empty");
    }).timeout(40000);
});
