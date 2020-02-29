import * as chai from "chai";
import { describe } from "mocha";
import * as pandoc from "../src/modules/pandoc";

describe("pandoc api", () => {
    it("pandoc config file creation simple", () => {
        const pandocConfigYmlString = pandoc.createPandocConfigFile({
            from: "markdown",
            to: "pdf"
        });
        chai.expect(pandocConfigYmlString).to.be.a("string");
        chai.assert(pandocConfigYmlString.length > 0);
        chai.expect(pandocConfigYmlString).deep.equal(
            "from: markdown\n"
            + "to: pdf\n"
        );
    });
    it("pandoc config file creation", () => {
        const pandocConfigYmlString = pandoc.createPandocConfigFile({
            from: "markdown",
            to: "pdf",
            inputFiles: [ "a.md", "b.md" ],
            variables: [{
                name: "documentclass",
                value: [ { name: "book" } ]
            }, {
                name: "classoption",
                value: [ { name: "twosides" }, { name: "draft" } ]
            }],
            metadata: {
                authors: [ "John Doe" ],
                title: "Document Title",
                date: "29.02.2020"
            },
            pdfEngine: "xelatex",
            pdfEngineOptions: ["-shell-escape"]
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
