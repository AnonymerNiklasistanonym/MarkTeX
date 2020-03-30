export interface PdfOptionsFooter {
    enabled?: string
    text?: string
}
export interface PdfOptionsHeader {
    enabled?: string
    text?: string
}
export enum PdfOptionsPaperSize {
    A4 = "A4"
}
export interface PdfOptionsTableOfContents {
    depth?: number
    enabled?: boolean
}

export interface PdfOptions {
    isPresentation?: boolean
    footer?: PdfOptionsFooter
    header?: PdfOptionsHeader
    pageNumbers?: boolean
    paperSize?: PdfOptionsPaperSize
    tableOfContents?: PdfOptionsTableOfContents
    useAuthors?: boolean
    useDate?: boolean
    useTitle?: boolean
    landscape?: boolean
    twoColumns?: boolean
}
