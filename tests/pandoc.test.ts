import * as pandoc from "../src/modules/pandoc";
import chai from "chai";
import { describe } from "mocha";


describe("pandoc", () => {
    it("create config file", () => {
        const pandocConfigYmlStringSimple = pandoc.createPandocConfigFile({
            from: "markdown",
            to: "pdf"
        });
        chai.expect(pandocConfigYmlStringSimple).to.be.a("string");
        chai.assert(pandocConfigYmlStringSimple.length > 0);
        chai.expect(pandocConfigYmlStringSimple).deep.equal(
            "from: markdown\n"
            + "to: pdf\n"
        );

        const pandocConfigYmlString = pandoc.createPandocConfigFile({
            from: "markdown",
            inputFiles: [ "a.md", "b.md" ],
            metadata: {
                authors: ["John Doe"],
                date: "29.02.2020",
                title: "Document Title"
            },
            pdfEngine: "xelatex",
            pdfEngineOptions: ["-shell-escape"],
            to: "pdf",
            variables: [ {
                name: "documentclass",
                value: [{ name: "book" }]
            }, {
                name: "classoption",
                value: [ { name: "twosides" }, { name: "draft" } ]
            } ]
        });
        chai.expect(pandocConfigYmlString).to.be.a("string");
        chai.assert(pandocConfigYmlString.length > 0);
        chai.expect(pandocConfigYmlString).deep.equal(
            "from: markdown\n"
            + "to: pdf\n"
            + "input-files:\n"
            + "  - a.md\n"
            + "  - b.md\n"
            + "variables:\n"
            + "  documentclass: book\n"
            + "  classoption:\n"
            + "    - twosides\n"
            + "    - draft\n"
            + "metadata:\n"
            + "  author:\n"
            + "    - John Doe\n"
            + "  title: Document Title\n"
            + "  date: 29.02.2020\n"
            + "pdf-engine: xelatex\n"
            + "pdf-engine-opts:\n"
            + "  - '-shell-escape'\n"
        );
    });
});
