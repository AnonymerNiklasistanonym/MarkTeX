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

export interface GetRequest {
    /** Document resource id */
    id: number
}
export interface GetRequestApi extends GetRequest, types.ApiRequest {}
export interface GetResponse {
    data: "TODO"
    binary: "TODO"
    name: "TODO"
}

export interface RemoveRequest {
    /** Document resource id */
    id: number
}
export interface RemoveRequestApi extends RemoveRequest, types.ApiRequest {}
export interface RemoveResponse {
    /** Removed document resource id */
    id: number
}
