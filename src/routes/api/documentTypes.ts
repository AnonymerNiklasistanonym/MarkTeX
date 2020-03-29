import * as types from "./apiTypes";

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
    footer?: PdfOptionsFooter
    header?: PdfOptionsHeader
    pageNumbers?: boolean
    paperSize?: PdfOptionsPaperSize
    tableOfContents?: PdfOptionsTableOfContents
    useAuthors?: boolean
    useDate?: boolean
    useTitle?: boolean
}

export interface CreateRequest {
    title: string
    authors?: string
    date?: string
    content: string
    pdfOptions?: PdfOptions
}

export interface CreateRequestApi extends CreateRequest, types.ApiRequest {}

export interface CreateResponse {
    id: number
    title: string
    authors?: string
    date?: string
}

export interface UpdateRequest {
    id: number
    title?: string
    authors?: string
    date?: string
    content?: string
    pdfOptions?: PdfOptions
}

export interface UpdateRequestApi extends UpdateRequest, types.ApiRequest {}

export interface UpdateResponse {
    id: number
    title: string
    authors?: string
    date?: string
}

export interface RemoveRequest {
    id: number
}

export interface RemoveRequestApi extends RemoveRequest, types.ApiRequest {}

export interface RemoveResponse {
    id: number
}

export interface ExportPdfRequest {
    id: number
}

export interface ExportPdfRequestApi extends ExportPdfRequest, types.ApiRequest {}

export interface ExportPdfResponse {
    id: number
    pdfData: Buffer
}

export interface ExportZipRequest {
    id: number
}

export interface ExportZipRequestApi extends ExportZipRequest, types.ApiRequest {}

export interface ExportZipResponse {
    id: number
    zipData: Buffer
}

export interface ExportJsonRequest {
    id: number
}

export interface ExportJsonRequestApi extends ExportJsonRequest, types.ApiRequest {}

// TODO Reuse interface for import
export interface ExportJsonResponseJsonData {
    title: string
    authors?: string
    date?: string
    content?: string
    pdfOptions?: PdfOptions
}

export interface ExportJsonResponse {
    id: number
    jsonData: ExportJsonResponseJsonData
}

export interface GetRequest {
    id: number
    getContent?: boolean
    getPdfOptions?: boolean
}

export interface GetRequestApi extends GetRequest, types.ApiRequest {}

export interface GetResponse {
    id: number
    title: string
    authors?: string
    date?: string
    content?: string
    pdfOptions?: PdfOptions
}
