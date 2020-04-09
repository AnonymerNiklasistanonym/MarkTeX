import * as types from "./apiTypes";


export interface AddRequest {
    accountId: number
    documentId: number
    writeAccess?: boolean
}
export interface AddRequestApi extends AddRequest, types.ApiRequest {}
export interface AddResponse {
    /** Access entry id */
    id: number
}

export interface AddNameRequest {
    accountName: string
    documentId: number
    writeAccess?: boolean
}
export interface AddNameRequestApi extends AddNameRequest, types.ApiRequest {}
export interface AddNameResponse {
    /** Access entry id */
    id: number
}

export interface RemoveRequest {
    /** Access entry id */
    id: number
}
export interface RemoveRequestApi extends RemoveRequest, types.ApiRequest {}
export interface RemoveResponse {
    /** Removed access entry id */
    id: number
}
