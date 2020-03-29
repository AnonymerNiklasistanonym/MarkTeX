import * as pandoc from "../pandoc";
import { PdfOptions, PdfOptionsPaperSize } from "./databaseManager/document";
import { debuglog } from "util";


const debug = debuglog("app-api-pandoc-manager");


// eslint-disable-next-line complexity
const pdfOptionsToPandocArgs = (input: Document2PdfInput|Document2ZipInput): pandoc.PandocConfigYmlInput => {
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
    }
    pandocArgs.variables = pandocArgsVariables;
    pandocArgs.metadata = pandocArgsMetadata;
    return pandocArgs;
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

export const document2Pdf = async (input: Document2PdfInput): Promise<Document2PdfOutput> => {
    debug(`document2Pdf: ${JSON.stringify(input)}`);
    const pandocOut = await pandoc.md2Pdf({
        files: [{
            data: input.content,
            filename: "document.md",
            sourceFile: true
        }],
        pandocOptions: {
            pandocArgs: {
                pdfEngine: "xelatex",
                ... pdfOptionsToPandocArgs(input)
            }
        }
    });
    debug(`pandocOut: ${JSON.stringify(pandocOut)}`);
    return {
        pdfData: pandocOut.pdfFile
    };
};

export interface Document2ZipInput {
    authors?: string
    content: string
    date?: string
    pdfOptions?: PdfOptions
    title: string
};

export interface Document2ZipOutput {
    zipData: Buffer
};

export const document2Zip = async (input: Document2ZipInput): Promise<Document2ZipOutput> => {
    debug(`document2Zip: ${JSON.stringify(input)}`);
    const pandocOut = await pandoc.md2Pdf({
        files: [{
            data: input.content,
            filename: "document.md",
            sourceFile: true
        }],
        options: { createSourceZipFile: true },
        pandocOptions: {
            pandocArgs: {
                pdfEngine: "xelatex",
                ... pdfOptionsToPandocArgs(input)
            }
        }
    });
    if (pandocOut.zipFile) {
        return {
            zipData: pandocOut.zipFile
        };
    } else {
        throw Error("No zip file buffer was found!");
    }
};
