import * as pandoc from "../pandoc";

const pandocOptions: pandoc.PandocMd2PdfInputPandocOptions = {
    pandocArgs: {
        pdfEngine: "xelatex",
        toc: false,
        tocDepth: 3,
        variables: [{
            name: "geometry",
            value: [ { name: "a4paper" }, { name: "margin=2cm" } ]
        }]
    }
};

export interface Document2PdfInput {
    title: string
    content: string
    authors: string
    date: string
};

export interface Document2PdfOutput {
    pdfData: Buffer
};

export const document2Pdf = async (input: Document2PdfInput): Promise<Document2PdfOutput> => {
    const pandocOut = await pandoc.md2Pdf({
        files: [{
            data: input.content,
            filename: "document.md",
            sourceFile: true
        }],
        pandocOptions
    });
    return {
        pdfData: pandocOut.pdfFile
    };
};

export interface Document2ZipInput {
    title: string
    content: string
    authors: string
    date: string
};

export interface Document2ZipOutput {
    zipData: Buffer
};

export const document2Zip = async (input: Document2ZipInput): Promise<Document2ZipOutput> => {
    const pandocOut = await pandoc.md2Pdf({
        files: [{
            data: input.content,
            filename: "document.md",
            sourceFile: true
        }],
        options: { createSourceZipFile: true },
        pandocOptions
    });
    if (pandocOut.zipFile) {
        return {
            zipData: pandocOut.zipFile
        };
    } else {
        throw Error("No zip file buffer was found!");
    }
};
