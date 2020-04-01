import * as pandoc from "../pandoc";
import { PdfOptions, PdfOptionsPaperSize } from "./databaseManager/documentPdfOptions";
import { debuglog } from "util";


const debug = debuglog("app-api-pandoc-manager");

// TODO Create seperated options for presentations and documents

// eslint-disable-next-line complexity
const pdfOptionsToPandocArgs = (input: Document2PdfInput|CreateSourceZipInput): pandoc.PandocConfigYmlInput => {
    const pandocArgs: pandoc.PandocConfigYmlInput = {};
    const pandocArgsMetadata: pandoc.PandocConfigYmlInputMetadata = {};
    const pandocArgsVariables: pandoc.PandocConfigYmlInputVariable[] = [];
    if (input.pdfOptions) {
        if (input.pdfOptions.useAuthors) {
            pandocArgsMetadata.authors = input.authors ? [input.authors] : [];
        }
        if (input.pdfOptions.useDate) {
            pandocArgsMetadata.date = input.date;
        }
        if (input.pdfOptions.useTitle) {
            pandocArgsMetadata.title = input.title;
        }
        if (input.pdfOptions.tableOfContents) {
            if (input.pdfOptions.tableOfContents.depth) {
                pandocArgs.tocDepth = input.pdfOptions.tableOfContents.depth;
            }
            if (input.pdfOptions.tableOfContents.enabled !== undefined) {
                pandocArgs.toc = input.pdfOptions.tableOfContents.enabled;
            }
        }
        if (input.pdfOptions.pageNumbers === false) {
            pandocArgsVariables.push({ name: "pagestyle", value: [{ name: "empty" }] });
        }
        if (input.pdfOptions.footer) {
            // TODO
        }
        if (input.pdfOptions.header) {
            // TODO
        }
        if (input.pdfOptions.paperSize && input.pdfOptions.paperSize === PdfOptionsPaperSize.A4) {
            pandocArgsVariables.push({
                name: "geometry",
                value: [ { name: "a4paper" }, { name: "margin=2cm" } ]
            });
        }
        if (input.pdfOptions.isPresentation) {
            pandocArgs.to = "beamer";
        }
        if (input.pdfOptions.landscape || input.pdfOptions.twoColumns) {
            const values = [];
            if (input.pdfOptions.landscape) {
                values.push({ name: "landscape" });
            }
            if (input.pdfOptions.twoColumns) {
                values.push({ name: "twocolumn" });
            }
            if (values.length > 0) {
                pandocArgsVariables.push({
                    name: "classoption",
                    value: values
                });
            }
        }
    }

    if (pandocArgsVariables.length > 0) {
        pandocArgs.variables = pandocArgsVariables;
    }
    if (pandocArgsMetadata && Object.keys(pandocArgsMetadata).length > 0) {
        pandocArgs.metadata = pandocArgsMetadata;
    }
    debug(`processed pandoc args: ${JSON.stringify(pandocArgs)}`);
    return pandocArgs;
};

/**
 * Extract from a document all header includes described in the LaTeX sections and add them to the document as pandoc
 * compatible header.
 *
 * This is done because there is no option to write header includes into the pandoc config file.
 *
 * @param content Markdown file content
 * @returns Updated Markdown file content with added pandoc header
 */
const extractHeaderIncludesAndAddPandocHeader = (content: string): string => {
    const allHeaderIncludes: string[] = [];
    const lines = content.split("\n").map(a => a.trim());
    const headerIncludesString = "% header-includes: ";
    for (const line of lines) {
        if (line.startsWith(headerIncludesString)) {
            const headerIncludes = line
                .slice(headerIncludesString.length, line.length)
                .split(" ")
                .filter(a => a.length > 0);
            allHeaderIncludes.push(... headerIncludes);
        }
    }
    if (allHeaderIncludes.length > 0) {
        const allUniqueHeaderIncludes = [... new Set(allHeaderIncludes)];
        return `---\nheader-includes: |\n  ${allUniqueHeaderIncludes.join("\n  ")}\n---\n\n${content}`;
    }
    return content;
};

export interface Document2PdfInput {
    authors?: string
    content: string
    date?: string
    pdfOptions?: PdfOptions
    title: string
};

export interface Document2PdfOutput {
    pdfData: Buffer
};

export const createPdf = async (input: Document2PdfInput): Promise<Document2PdfOutput> => {
    debug(`document2Pdf: ${JSON.stringify(input)}`);
    const pandocOut = await pandoc.md2Pdf({
        files: [{
            data: extractHeaderIncludesAndAddPandocHeader(input.content),
            filename: "document.md",
            sourceFile: true
        }],
        mode: pandoc.PandocMd2PdfMode.PDF_ONLY,
        pandocOptions: {
            pandocArgs: {
                pdfEngine: "xelatex",
                ... pdfOptionsToPandocArgs(input)
            }
        }
    });
    if (pandocOut.pdfFile) {
        return { pdfData: pandocOut.pdfFile };
    }
    throw Error("Pdf output was undefined");
};

export interface CreateSourceZipInput {
    authors?: string
    content: string
    date?: string
    pdfOptions?: PdfOptions
    title: string
};

export interface CreateSourceZipOutput {
    zipData: Buffer
};

export const createSourceZip = async (input: CreateSourceZipInput): Promise<CreateSourceZipOutput> => {
    debug(`document2Zip: ${JSON.stringify(input)}`);
    const pandocOut = await pandoc.md2Pdf({
        files: [{
            data: extractHeaderIncludesAndAddPandocHeader(input.content),
            filename: "document.md",
            sourceFile: true
        }],
        mode: pandoc.PandocMd2PdfMode.SOURCE_ONLY,
        pandocOptions: {
            pandocArgs: {
                pdfEngine: "xelatex",
                ... pdfOptionsToPandocArgs(input)
            }
        }
    });
    if (pandocOut.zipFile) {
        return { zipData: pandocOut.zipFile };
    }
    throw Error("Source file output was undefined");
};
