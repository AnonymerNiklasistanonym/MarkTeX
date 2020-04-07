import * as types from "./apiTypes";
import { PdfOptions } from "../../modules/api/databaseManager/documentPdfOptions";

export interface CreateRequest {
    owner: number
    title: string
    authors?: string
    date?: string
    content: string
    pdfOptions?: PdfOptions
    public?: boolean
}

export interface CreateRequestApi extends CreateRequest, types.ApiRequest {}

export interface CreateResponse {
    id: number
    title: string
    authors?: string
    date?: string
    owner: number
    public: boolean
}

export interface UpdateRequest {
    id: number
    title?: string
    authors?: string
    date?: string
    content?: string
    pdfOptions?: PdfOptions
    public?: boolean
}

export interface UpdateRequestApi extends UpdateRequest, types.ApiRequest {}

export interface UpdateResponse {
    id: number
    title: string
    authors?: string
    date?: string
    public: boolean
    owner: number
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
    content: string
    pdfOptions?: PdfOptions
    public: boolean
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
    owner: number
    public: boolean
}
